var koa = require('koa');
var logger = require('koa-logger');
var mount = require('koa-mount');

// Resources
var users = require('./resources/users');

var app = koa();
app.use(logger());
app.use(mount('/users', users.middleware()));

module.exports = app
