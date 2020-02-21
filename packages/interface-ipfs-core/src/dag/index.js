'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  get: require('./get'),
  put: require('./put'),
  tree: require('./tree')
}

module.exports = createSuite(tests)
