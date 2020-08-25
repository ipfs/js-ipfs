'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  add: require('./add'),
  addAll: require('./add-all'),
  ls: require('./ls'),
  rm: require('./rm'),
  rmAll: require('./rm-all')
}

module.exports = createSuite(tests)
