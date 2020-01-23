'use strict'

module.exports = config => ({
  apply: require('./apply')(config),
  list: require('./list')(config)
})
