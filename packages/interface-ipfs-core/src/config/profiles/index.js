'use strict'
const { createSuite } = require('../../utils/suite')

const tests = {
  list: require('./list'),
  apply: require('./apply')
}

module.exports = createSuite(tests)
