var thinky = require('../thinky')
var utils = require('../utils')
var config = require('../config');

var model = {}

var Action = thinky.createModel("Action", {
	id: String,
	type: String,
	date: {_type: Date, default: Date()}
});

model.Action = Action

module.exports = model
