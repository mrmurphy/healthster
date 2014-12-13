var user = require('./user')
var action = require('./action')
var relationships = require('./relationships')

relationships.establish()

module.exports = {
  user: user,
  action: action
}
