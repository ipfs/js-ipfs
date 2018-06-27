'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  get: require('./get'),
  put: require('./put'),
  findpeer: require('./findpeer'),
  provide: require('./provide'),
  findprovs: require('./findprovs'),
  query: require('./query')
}

module.exports = createSuite(tests)
