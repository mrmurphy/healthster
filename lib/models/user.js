var bb = require('bluebird')

var thinky = require('../thinky')
var utils = require('../utils')
var config = require('../config')

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
// returns: null or [list of missing attrs]
model.validateParamsForNew = function (params) {
	var missingAttrs = []
	if (params.email === undefined) {
		missingAttrs.push("email")
	}
	if (params.password === undefined) {
		missingAttrs.push("password")
	}
	if (missingAttrs.length !== 0) {
		return missingAttrs
	} else {
		return null
	}
}

// sanitizeParams takes a request body, and returns a new object
// which is only the intersection of the request body and attrsSettable.
// if the params contain a password, the password is hashed, and applied
// as the pwdhash attribute.
model.sanitizeParams = function (params) {
	var sanitized = {}
	model.attrsSettable.forEach(function (attr) {
		if (params[attr] !== undefined) {
			if (attr === "password") {
				sanitized.pwdhash = utils.hashPassword(params[attr])
			} else {
				sanitized[attr] = params[attr]
			}
		}
	})
	return sanitized
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

User.define("updateFromRequestParams", function(rParams) {
	var self = this
	rParams = model.sanitizeParams(rParams)
	for (var attr in rParams) {
		if (rParams.hasOwnProperty(attr)) {
			self[attr] = rParams[attr]
		}
	}
});

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
	.catch(thinky.Errors.DocumentNotFound, function () {
		return new bb.Promise(function (resolve) {
			resolve(null)
		})
	})
}

model.User = User

module.exports = model
