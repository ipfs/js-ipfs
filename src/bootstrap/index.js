'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  add: require('./add'),
  list: require('./list'),
  rm: require('./rm')
}

module.exports = createSuite(tests)
