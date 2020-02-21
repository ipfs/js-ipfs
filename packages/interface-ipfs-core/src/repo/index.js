'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  version: require('./version'),
  stat: require('./stat'),
  gc: require('./gc')
}

module.exports = createSuite(tests)
