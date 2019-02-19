'use strict'

const { createSuite } = require('../utils/suite')

const tests = {
  add: require('./add'),
  addReadableStream: require('./add-readable-stream'),
  addPullStream: require('./add-pull-stream'),
  addFromStream: require('./add-from-stream'),
  addFromURL: require('./add-from-url'),
  addFromFs: require('./add-from-fs'),
  cat: require('./cat'),
  catReadableStream: require('./cat-readable-stream'),
  catPullStream: require('./cat-pull-stream'),
  get: require('./get'),
  getReadableStream: require('./get-readable-stream'),
  getPullStream: require('./get-pull-stream'),
  ls: require('./ls'),
  lsReadableStream: require('./ls-readable-stream'),
  lsPullStream: require('./ls-pull-stream')
}

module.exports = createSuite(tests)
