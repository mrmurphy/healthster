var Router = require('koa-router');
var koaBody = require('koa-body')();

var models = require('../models');
var thinky = require('../thinky');
var settings = require('../config');

var User = models.User;
var Action = models.Action;
var r = thinky.r;

var router = new Router();

function checkRequiredUserParams (ctx) {
	if (!ctx.request.body.email) {
		ctx.body = 'Email attribute is required';
		ctx.status = 400;
		return false;
	}
	if (!ctx.request.body.password) {
		ctx.body = 'Name attribute is required'
		ctx.status = 400;
		return false;
	}
	return true;
}

router.put('createNewUser', '/', koaBody, function *() {
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
