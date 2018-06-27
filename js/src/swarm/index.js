'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  connect: require('./connect'),
  peers: require('./peers'),
  addrs: require('./addrs'),
  localAddrs: require('./local-addrs'),
  disconnect: require('./disconnect')
}

module.exports = createSuite(tests)
