'use strict'

const { createSuite } = require('../utils/suite')

const tests = {
  mkdir: require('./mkdir'),
  write: require('./write'),
  cp: require('./cp'),
  mv: require('./mv'),
  rm: require('./rm'),
  stat: require('./stat'),
  read: require('./read'),
  readReadableStream: require('./read-readable-stream'),
  readPullStream: require('./read-pull-stream'),
  ls: require('./ls'),
  flush: require('./flush')
}

module.exports = createSuite(tests)
