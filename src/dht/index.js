'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  get: require('./get'),
  put: require('./put'),
  findPeer: require('./find-peer'),
  provide: require('./provide'),
  findProvs: require('./find-provs'),
  query: require('./query')
}

module.exports = createSuite(tests)
