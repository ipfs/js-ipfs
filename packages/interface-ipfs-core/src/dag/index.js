'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  get: require('./get'),
  put: require('./put'),
  resolve: require('./resolve'),
  tree: require('./tree')
}

module.exports = createSuite(tests)
