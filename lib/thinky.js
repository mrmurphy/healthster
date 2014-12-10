var thinky = require('thinky')

var config = require('./config')

module.exports = thinky({
  db: config.db
})
