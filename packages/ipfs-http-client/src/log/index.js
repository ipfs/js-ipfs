'use strict'

module.exports = config => ({
  tail: require('./tail')(config),
  ls: require('./ls')(config),
  level: require('./level')(config)
})
