'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  ls: require('./ls'),
  lsReadableStream: require('./ls-readable-stream'),
  lsPullStream: require('./ls-pull-stream')
}

module.exports = createSuite(tests)
