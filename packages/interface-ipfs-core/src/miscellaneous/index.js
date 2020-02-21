'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  id: require('./id'),
  version: require('./version'),
  dns: require('./dns'),
  stop: require('./stop'),
  resolve: require('./resolve')
}

module.exports = createSuite(tests)
