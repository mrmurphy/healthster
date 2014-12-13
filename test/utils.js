var bb = require('bluebird')

var thinky = require('../lib/thinky')
var config = require('../lib/config')
var models = require('../lib/models')

var User = models.user.User

module.exports = {
  resetDB: function() {
    return thinky.r.tableList().run()
    .then(function (tables) {
      return bb.all(tables.map(function (table) {
        return thinky.r.table(table).delete().run()
      }))
    })
  },
  createUsers: function(newUsersArray) {
    if (newUsersArray === undefined) {
      newUsersArray = [{
    		name: "Han Solo",
    		email: "han@solo.hoth",
        password: "wookie"
      }]
    }

    var newUser = null
    var newUserPassword = null
    for (var i = 0; i < newUsersArray.length; i++) {
      newUserPassword = newUsersArray[i].password
      delete newUsersArray[i].password
      newUser = new User(newUsersArray[i])
      newUser.setPassword(newUserPassword)
      newUsersArray[i] = newUser
    }

    return bb.all(newUsersArray.map(function (user) {
      return user.save()
    }))
    .then(function () {
      return newUsersArray
    })
  }
}
