var Router = require('koa-router');
var koaBody = require('koa-body')();

var models = require('../models');
var thinky = require('../thinky');
var settings = require('../config');

var user = models.user
var User = user.User
var r = thinky.r;

var router = new Router();
// TODO: This goes in the user model now
// function checkRequiredUserParams (ctx) {
// 	if (!ctx.request.body.email) {
// 		ctx.body = 'Email attribute is required';
// 		ctx.status = 400;
// 		return false;
// 	}
// 	if (!ctx.request.body.password) {
// 		ctx.body = 'Name attribute is required'
// 		ctx.status = 400;
// 		return false;
// 	}
// 	return true;
// }


// createNewUser takes a request context, and creates a new user from
// it. A promise is returned with the following actions:
//
// Successful creation: Fulfilled with new user
//
// User with same email already in DB: Rejected with error
//
// Error: Rejected with error
function createNewUser(ctx) {
  // TODO
}

// modifyUser takes a request context, and modies an existing user from
// it. A promise is returned with the following actions:
//
// Successful modification: Fulfilled with modified user
//
// Error: Rejected with error
function modifyUser(ctx) {
  // TODO
}

// createNewUser will attempt to create a new user if no user ID is sent
// in the body of the request. If a user exists in the db with that email
// already, the request is rejected with a 409 error.
// If an ID is present in the request body, we attempt to modify the that
// user in the db, updating the attributes that are passed as part of the
// request body.
router.put('createOrModifyUser', '/', koaBody, function *() {
	var handlingUser = null
	// If there is no ID in the post body, we're creating a new user:
	if (this.request.body.id !== undefined) {
		try {
			yield handlingUser = createNewUser(this)
		} catch (err) {
			this.status = 500
			this.body = "There was a problem creating the new user: " + err
			return
		}
	} else {
		// If there is an ID in the post body, modify a user.
		try {
			yield handlingUser = modifyUser(this)
		} catch(err) {
			this.status = 500
			this.body = "There was a problem modifying the user: " + err
		}
	}
	this.body = handlingUser.toJSON()

	// if (checkRequiredUserParams(this) === false) { //TODO To be implemented above.
	// 	return;
	// }
	//
	// var email = this.request.body.email
	// var existingUsers = yield User.getAll(email, {index: 'email'}).run()
	// if (existingUsers.length !== 0) {
	// 	this.status = 409
	// 	this.body = "A user with that email address already exists!"
	// 	return
	// }
	//
	// var newUser = new User({
	// 	name: this.request.body.name,
	// 	email: this.request.body.email
	// });
	// newUser.setPassword(this.request.body.password);
	// yield newUser.save();
	// this.body = newUser.toJSON()
})

router.put('modifyUser', '/:id', koaBody, function *() {

	if (checkRequiredUserParams(this) === false) {
		return;
	}
	var email = this.request.body.email
	var existingUsers = yield User.getAll(email, {index: 'email'}).run()
	if (existingUsers.length !== 0) {
		this.status = 409
		this.body = "A user with that email address already exists!"
		return
	}

	var newUser = new User({
		name: this.request.body.name,
		email: this.request.body.email
	});
	newUser.setPassword(this.request.body.password);
	yield newUser.save();
	this.body = newUser.toJSON()
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
