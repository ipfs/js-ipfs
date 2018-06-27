'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  publish: require('./publish'),
  subscribe: require('./subscribe'),
  unsubscribe: require('./unsubscribe'),
  peers: require('./peers'),
  ls: require('./ls')
}

module.exports = createSuite(tests)
