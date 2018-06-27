'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  stat: require('./stat'),
  wantlist: require('./wantlist'),
  unwant: require('./unwant')
}

module.exports = createSuite(tests)
