'use strict'

const promisify = require('promisify-es6')
const ConcatStream = require('concat-stream')
const once = require('once')
const isStream = require('is-stream')
const OtherBuffer = require('buffer').Buffer
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

    const ok = Buffer.isBuffer(_files) ||
               isStream.readable(_files) ||
               Array.isArray(_files) ||
               OtherBuffer.isBuffer(_files) ||
               typeof _files === 'object' ||
               isSource(_files)

    if (!ok) {
      return callback(new Error('first arg must be a buffer, readable stream, pull stream, an object or array of objects'))
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
