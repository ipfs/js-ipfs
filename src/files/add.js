'use strict'

const promisify = require('promisify-es6')
const ConcatStream = require('concat-stream')
const once = require('once')
const isStream = require('is-stream')
const SendFilesStream = require('../utils/send-files-stream')

module.exports = (send) => {
  const createAddStream = SendFilesStream(send, 'add')

  return promisify((_files, options, _callback) => {
    if (typeof options === 'function') {
      _callback = options
      options = null
    }

    const callback = once(_callback)

    if (!options) {
      options = {}
    }

    const ok = Buffer.isBuffer(_files) ||
               isStream.readable(_files) ||
               Array.isArray(_files)

    if (!ok) {
      return callback(new Error('"files" must be a buffer, readable stream, or array of objects'))
    }

    const files = [].concat(_files)

    const stream = createAddStream(options)
    const concat = ConcatStream((result) => callback(null, result))
    stream.once('error', callback)
    stream.pipe(concat)

    files.forEach((file) => stream.write(file))
    stream.end()
  })
}
