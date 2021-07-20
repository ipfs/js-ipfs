'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  export: require('./export'),
  get: require('./get'),
  put: require('./put'),
  import: require('./import'),
  resolve: require('./resolve')
}

module.exports = createSuite(tests)
