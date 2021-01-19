'use strict'
const { createSuite } = require('../../utils/suite')

const tests = {
  service: require('./service'),
  add: require('./add'),
  ls: require('./ls'),
  rm: require('./rm'),
  rmAll: require('./rm-all')
}

module.exports = createSuite(tests)
