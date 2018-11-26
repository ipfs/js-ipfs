'use strict'

const promisify = require('promisify-es6')
const ConcatStream = require('concat-stream')
const once = require('once')
const isStream = require('is-stream')
const isString = require('lodash/isString')
const isSource = require('is-pull-stream').isSource
const FileResultStreamConverter = require('../utils/file-result-stream-converter')
const SendFilesStream = require('../utils/send-files-stream')

module.exports = (send) => {
  const createAddStream = SendFilesStream(send, 'add')

  const add = promisify((_files, options, _callback) => {
    if (typeof options === 'function') {
      _callback = options
      options = null
    }

    const callback = once(_callback)

    if (!options) {
      options = {}
    }
    options.converter = FileResultStreamConverter

    // Buffer, pull stream or Node.js stream
    const isBufferOrStream = obj => Buffer.isBuffer(obj) || isStream.readable(obj) || isSource(obj)
    // An object like { content?, path? }, where content isBufferOrStream and path isString
    const isContentObject = obj => {
      if (typeof obj !== 'object') return false
      // path is optional if content is present
      if (obj.content) return isBufferOrStream(obj.content)
      // path must be a non-empty string if no content
      return Boolean(obj.path) && isString(obj.path)
    }
    // An input atom: a buffer, stream or content object
    const isInput = obj => isBufferOrStream(obj) || isContentObject(obj)
    // All is ok if data isInput or data is an array of isInput
    const ok = isInput(_files) || (Array.isArray(_files) && _files.every(isInput))

    if (!ok) {
      return callback(new Error('invalid input: expected buffer, readable stream, pull stream, object or array of objects'))
    }

    const files = [].concat(_files)

    const stream = createAddStream({ qs: options })
    const concat = ConcatStream((result) => callback(null, result))
    stream.once('error', callback)
    stream.pipe(concat)

    files.forEach((file) => stream.write(file))
    stream.end()
  })

  return function () {
    const args = Array.from(arguments)

    // If we files.add(<pull stream>), then promisify thinks the pull stream is
    // a callback! Add an empty options object in this case so that a promise
    // is returned.
    if (args.length === 1 && isSource(args[0])) {
      args.push({})
    }

    return add.apply(null, args)
  }
}
