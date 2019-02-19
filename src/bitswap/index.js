'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  stat: require('./stat'),
  wantlist: require('./wantlist')
}

module.exports = createSuite(tests)
