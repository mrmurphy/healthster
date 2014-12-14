var assert = require('assert')
var request = require('supertest-as-promised')

var config = require('../lib/config')
config.db = config.test.db // This goes before other project imports!

var thinky = require('../lib/thinky')
var models = require('../lib/models')
var tutils = require('./utils')
var app = require('../lib/app')

var User = models.user.User

request = request.agent(app.listen())

beforeEach(function() {
    return tutils.resetDB()
})

describe('The Users resource', function() {
  it('should create a new user', function() {
    return request.put('/users').send({
      name: "Han Solo",
      email: "han@solo.hoth",
      password: "wookie"
    })
    .expect(200)
    .then(function () {
      return User.getAll("han@solo.hoth", {index: 'email'}).run()
    })
    .then(function (users) {
      assert.notEqual(users, null)
      assert.equal(users[0].email, "han@solo.hoth")
      assert.equal(users[0].pwdhash, "wookiehashed")
    })
  })

  it("should return JSON for a specific user", function () {
    createdUser = null
    return tutils.createUsers()
    .then(function (userArray) {
      createdUser = userArray[0]
      return request.get('/users/' + createdUser.id)
      .expect(200)
    })
    .then(function (resp) {
      respObj = JSON.parse(resp.text)
      assert.deepEqual(respObj, {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email
      })
      assert.equal(respObj.pwdhash, undefined)
    })
  })

  it("should return JSON for all users", function () {
    createdUsers = null
    return tutils.createUsers([{
      name: "Gary 1",
      email: "gary@larson.tfs",
      password: "p1"
    }, {
      name: "Gary 2",
      email: "gary2@larson.tfs",
      password: "p2"
    }])
    .then(function (users) {
      createdUsers = users
      return request.get('/users')
      .expect(200)
    })
    .then(function (resp) {
      respObj = JSON.parse(resp.text)
      respObj.sort(function (a, b) {
        return a.name < b.name ? -1 : 1
      })
      assert.deepEqual(respObj, createdUsers.map(function (user) {
        return {
          email: user.email,
          name: user.name,
          id: user.id
        }
      }))
      assert.equal(respObj[0].pwdhash, undefined)
      assert.equal(respObj[1].pwdhash, undefined)
    })
  })

  it("should modify a user", function() {
    createdUser = null
    return tutils.createUsers()
    .then(function (userArray) {
      createdUser = userArray[0]
      return request.put('/users')
      .send({
        id: createdUser.id,
        name: "Modified!"
      })
      .expect(200)
    })
    .then(function (resp) {
      respObj = JSON.parse(resp.text)
      assert.deepEqual(respObj, {
        id: createdUser.id,
        name: "Modified!",
        email: createdUser.email
      })
    })
  })

  it("should not create a user if a user already exists", function() {
    createdUser = null
    return tutils.createUsers()
    .then(function (userArray) {
      createdUser = userArray[0]
      return request.put('/users')
      .send({
        name: createdUser.name,
        email: createdUser.email,
        password: "foo foo bar"
      })
      .expect(409)
    })
  })

  it("should 404 if attempting to modify a nonexistant user", function() {
    return request.put('/users')
    .send({
      id: "nonexist",
      name: "Jim",
      password: "jimpass"
    })
    .expect(404)
  })
})
