'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  add: require('./add'),
  ls: require('./ls'),
  rm: require('./rm')
}

module.exports = createSuite(tests)
