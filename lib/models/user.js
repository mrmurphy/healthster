var thinky = require('../thinky')
var utils = require('../utils')
var config = require('../config');

var model = {}

model.attrsSettable = [
	"name",
	"email",
	"password"
]

model.attrsPrintable = [
	"id",
  "name",
  "email"
]

// validateParamsForNew ensures that a request body contains
// correct attributes for creating a new user.
model.validateParamsForNew = function (params) {

}

// sanitizeParams takes a request body, and returns a new object
// which is only the intersection of the request body and attrsSettable.
model.sanitizeParams = function (params) {

}

var User = thinky.createModel("User", {
	id: String,
	name: String,
	email: String,
	pwdhash: String
});

User.define("setPassword", function(pw) {
	this.pwdhash = utils.hashPassword(pw);
});

User.define('updateFromRequestParams', function(params) {
	var self = this
	model.attrsSettable.forEach(function(attr) {
		if (params[attr] !== null && params[attr] !== undefined) {
			self[attr] = params[attr]
		}
	})
})

// safe returns an object with attributes copied from this model.
// Any attributes not in model.attrsPrintable are not included.
User.define('safe', function() {
	var self = this
	var safeCopy = {}
	model.attrsPrintable.forEach(function(attr) {
		safeCopy[attr] = self[attr]
	})
	return safeCopy
})

User.define("toJSON", function() {
	return JSON.stringify(this.safe(), null, config.pprint)
})

// getUserByEmail takes an email address string as a parameter and does
// returns a promise which does one of the following things:
//
// User with email exists: fulfills with user
//
// User doesn't exists: fulfills with null
//
// More than one user with email: throws an error
model.getUserByEmail = function (email) {
	return User.getAll(email, {index: 'email'}).run()
	.then(function (users) {
		if (users.length === 0) {
			return null
		}
		if (users.length > 1) {
			throw new Error("Multiple users with email: " + email + " exist.")
		}
		return users[0]
	})
}

// getUserById takes a string id and returns a promise which does one of the
// following:
//
// User exists: fulfillls with user
//
// User doesn't exist: fulfillls with null
model.getUserById = function (id) {
	return User.get(id).run()
	.then(function (user) {
		return user
	}, function () {
		return null
	})
}

model.User = User

module.exports = model
