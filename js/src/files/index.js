'use strict'
const { createSuite } = require('../utils/suite')

const tests = {
  add: require('./add'),
  addReadableStream: require('./add-readable-stream'),
  addPullStream: require('./add-pull-stream'),
  cat: require('./cat'),
  catReadableStream: require('./cat-readable-stream'),
  catPullStream: require('./cat-pull-stream'),
  get: require('./get'),
  getReadableStream: require('./get-readable-stream'),
  getPullStream: require('./get-pull-stream'),
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
