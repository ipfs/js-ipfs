'use strict'

const nodeify = require('promise-nodeify')
const moduleConfig = require('../utils/module-config')
const { collectify, pullify, streamify } = require('../lib/converters')

module.exports = (arg) => {
  const send = moduleConfig(arg)
  const add = require('../add')(arg)
  const addFromFs = require('../add-from-fs')(arg)
  const addFromURL = require('../add-from-url')(arg)

  return {
    add: (input, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(add)(input, options), callback)
    },
    addReadableStream: streamify.transform(add),
    addPullStream: pullify.transform(add),
    addFromFs: (path, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(addFromFs)(path, options), callback)
    },
    addFromURL: (url, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(addFromURL)(url, options), callback)
    },
    addFromStream: (input, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      return nodeify(collectify(add)(input, options), callback)
    },
    _addAsyncIterator: add,
    cat: require('../files-regular/cat')(send),
    catReadableStream: require('../files-regular/cat-readable-stream')(send),
    catPullStream: require('../files-regular/cat-pull-stream')(send),
    get: require('../files-regular/get')(send),
    getReadableStream: require('../files-regular/get-readable-stream')(send),
    getPullStream: require('../files-regular/get-pull-stream')(send),
    ls: require('../files-regular/ls')(send),
    lsReadableStream: require('../files-regular/ls-readable-stream')(send),
    lsPullStream: require('../files-regular/ls-pull-stream')(send),
    refs: require('../files-regular/refs')(send),
    refsReadableStream: require('../files-regular/refs-readable-stream')(send),
    refsPullStream: require('../files-regular/refs-pull-stream')(send)
  }
}
