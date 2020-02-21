'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  put: require('./put'),
  get: require('./get'),
  findPeer: require('./find-peer'),
  provide: require('./provide'),
  findProvs: require('./find-provs'),
  query: require('./query')
}

module.exports = createSuite(tests)
