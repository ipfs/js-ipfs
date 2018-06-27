'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  ping: require('./ping'),
  pingPullStream: require('./ping-pull-stream'),
  pingReadableStream: require('./ping-readable-stream')
}

module.exports = createSuite(tests)
