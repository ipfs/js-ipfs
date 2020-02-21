'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  get: require('./get'),
  set: require('./set'),
  replace: require('./replace'),
  profiles: require('./profiles')
}

module.exports = createSuite(tests)
