'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  gen: require('./gen'),
  list: require('./list'),
  rename: require('./rename'),
  rm: require('./rm'),
  import: require('./import')
}

module.exports = createSuite(tests)
