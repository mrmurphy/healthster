var Router = require('koa-router')
var koaBody = require('koa-body')()

var models = require('../models')
var thinky = require('../thinky')
var settings = require('../config')

var user = models.user
var User = user.User
var r = thinky.r

var router = new Router()

// createNewUser acts like a request handler and updates a user.
function *createNewUser() {
	// Make sure required params are there.
	var err = user.validateParamsForNew(this.request.body)
	if (err !== null) {
		this.status = 400
		this.body = "Missing required parameters to create a new user: " + err
		return
	}

	// Check to see if a user with that email already exists.
	var existing = null
	try {
		existing = yield user.getUserByEmail(this.request.body.email)
		if (existing !== null) {
			this.status = 409
			this.body = "A user with email " + this.request.body.email
			+ "already exists."
			return
		}
	} catch (err) {
		this.status = 500
		this.body = "Multiple users already exist with email "
		+ this.request.body.email + ". How did that happen?"
		return
	}

	// Create a new user from the request body.
	var sanitized = user.sanitizeParams(this.request.body)
	var newUser = new User(sanitized)
	yield newUser.save()
	this.body = newUser.toJSON()
}

// modifyUser acts like a request handler and updates a user
function *modifyUser() {
	debugger
	var existingUser = null
	try {
	  existingUser = yield user.getUserById(this.request.body.id)
	} catch (err) {
		this.status = 500
		this.body = "There was an error while fetching the user with id: "
		+ this.request.body.id + " from the database: " + err
		return
	}
	if (existingUser === null) {
		this.status = 404
		this.body = "The user with id " + this.request.body.id + " was not found."
		return
	}
	existingUser.updateFromRequestParams(this.request.body)
	yield existingUser.save()
	this.body = existingUser.toJSON()
}

// createOrModifyUser will attempt to create a new user if no user ID is sent
// in the body of the request. If a user exists in the db with that email
// already, the request is rejected with a 409 error.
// If an ID is present in the request body, we attempt to modify the that
// user in the db, updating the attributes that are passed as part of the
// request body.
router.put('createOrModifyUser', '/', koaBody, function *() {
	if (this.request.body.id === undefined) {
		yield createNewUser.call(this)
	} else {
		yield modifyUser.call(this)
	}
})

router.get('readAllUsers', '/', function *() {
	var users = yield User.orderBy({index: r.desc('id')}).run()
	this.body = JSON.stringify(users.map(function(user) {
		return user.safe()
	}), null, settings.pprint)
})

router.get('readUser', '/:id', function *() {
	var user = yield User.get(this.params.id).run()
	this.body = user.toJSON()
})

module.exports = router;
