'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  new: require('./new'),
  put: require('./put'),
  get: require('./get'),
  data: require('./data'),
  links: require('./links'),
  stat: require('./stat'),
  patch: require('./patch')
}

module.exports = createSuite(tests)
