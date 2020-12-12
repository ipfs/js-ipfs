'use strict'
const { createSuite } = require('../../utils/suite')

const tests = {
  service: require('./service')
}

module.exports = createSuite(tests)
