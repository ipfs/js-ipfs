'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  ping: require('./ping')
}

module.exports = createSuite(tests)
