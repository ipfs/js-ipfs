'use strict'
const { createSuite } = require('../../utils/suite')

const tests = {
  service: require('./service'),
  add: require('./add')
}

module.exports = createSuite(tests)
