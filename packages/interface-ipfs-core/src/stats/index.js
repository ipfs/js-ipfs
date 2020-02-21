'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  bitswap: require('./bitswap'),
  bw: require('./bw'),
  repo: require('./repo')
}

module.exports = createSuite(tests)
