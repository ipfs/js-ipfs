'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  get: require('./get'),
  set: require('./set'),
  replace: require('./replace'),
  profile: require('./profile')
}

module.exports = createSuite(tests)
