'use strict'

const { createSuite } = require('../utils/suite')

const tests = {
  chmod: require('./chmod'),
  cp: require('./cp'),
  flush: require('./flush'),
  ls: require('./ls'),
  mkdir: require('./mkdir'),
  mv: require('./mv'),
  read: require('./read'),
  rm: require('./rm'),
  stat: require('./stat'),
  touch: require('./touch'),
  write: require('./write')
}

module.exports = createSuite(tests)
