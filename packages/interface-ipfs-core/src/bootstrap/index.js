'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  add: require('./add'),
  clear: require('./clear'),
  list: require('./list'),
  reset: require('./reset'),
  rm: require('./rm')
}

module.exports = createSuite(tests)
