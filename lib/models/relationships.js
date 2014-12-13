var User = require("./user").User
var Action = require("./action").Action

module.exports = {
  establish: function () {
    User.hasMany(Action, "actions", "id", "userId")
    Action.belongsTo(User, "user", "userId", "id")
  }
}
