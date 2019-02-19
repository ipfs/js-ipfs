'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  publish: require('./publish'),
  resolve: require('./resolve')
}

module.exports = createSuite(tests)
