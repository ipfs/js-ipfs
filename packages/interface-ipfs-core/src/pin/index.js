'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  ls: require('./ls'),
  rm: require('./rm'),
  add: require('./add')
}

module.exports = createSuite(tests)
