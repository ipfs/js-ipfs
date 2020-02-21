'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  get: require('./get'),
  put: require('./put'),
  rm: require('./rm'),
  stat: require('./stat')
}

module.exports = createSuite(tests)
