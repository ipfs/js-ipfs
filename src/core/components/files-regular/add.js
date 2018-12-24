'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream')
const sort = require('pull-sort')
const isStream = require('is-stream')
const isSource = require('is-pull-stream').isSource

module.exports = function (self) {
  const add = promisify((data, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = options || {}

    // Buffer, pull stream or Node.js stream
    const isBufferOrStream = obj => Buffer.isBuffer(obj) || isStream.readable(obj) || isSource(obj)
    // An object like { content?, path? }, where content isBufferOrStream and path isString
    const isContentObject = obj => {
      if (typeof obj !== 'object') return false
      // path is optional if content is present
      if (obj.content) return isBufferOrStream(obj.content)
      // path must be a non-empty string if no content
      return Boolean(obj.path) && typeof obj.path === 'string'
    }
    // An input atom: a buffer, stream or content object
    const isInput = obj => isBufferOrStream(obj) || isContentObject(obj)
    // All is ok if data isInput or data is an array of isInput
    const ok = isInput(data) || (Array.isArray(data) && data.every(isInput))

    if (!ok) {
      return callback(new Error('invalid input: expected buffer, readable stream, pull stream, object or array of objects'))
    }

    pull(
      pull.values([data]),
      self.addPullStream(options),
      sort((a, b) => {
        if (a.path < b.path) return 1
        if (a.path > b.path) return -1
        return 0
      }),
      pull.collect(callback)
    )
  })

  return function () {
    const args = Array.from(arguments)

    // If we .add(<pull stream>), then promisify thinks the pull stream
    // is a callback! Add an empty options object in this case so that a
    // promise is returned.
    if (args.length === 1 && isSource(args[0])) {
      args.push({})
    }

    return add.apply(null, args)
  }
}
