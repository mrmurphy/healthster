"use strict";

var thinky = require('./thinky')
var utils = require('./utils')
var config = require('./config');

var User = thinky.createModel("User", {
	id: String,
	name: String,
	email: String,
	pwdhash: String
});

User.define("setPassword", function(pw) {
	this.pwdhash = utils.hashPassword(pw);
});

User.define('getSafeAttrs', function() {
	return ["id", "name", "email"];
});

User.define('safe', function() {
	var self = this
	var safeCopy = {}
	self.getSafeAttrs().forEach(function(attr) {
		safeCopy[attr] = self[attr]
	})
	return safeCopy
})

User.define("toJSON", function() {
	return JSON.stringify(this.safe(), null, config.pprint)
})

User.ensureIndex('email');

var Action = thinky.createModel("Action", {
	id: String,
	type: String,
	date: {_type: Date, default: Date()}
});

User.hasMany(Action, "actions", "id", "userId");
Action.belongsTo(User, "user", "userId", "id");

module.exports = {
	User: User,
	Action: Action
}
