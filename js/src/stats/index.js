'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  bitswap: require('./bitswap'),
  bw: require('./bw'),
  bwPullStream: require('./bw-pull-stream'),
  bwReadableStream: require('./bw-readable-stream'),
  repo: require('./repo')
}

module.exports = createSuite(tests)
