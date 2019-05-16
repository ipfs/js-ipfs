'use strict'

const promisify = require('promisify-es6')
const ConcatStream = require('concat-stream')
const once = require('once')
const { isSource } = require('is-pull-stream')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')
const SendFilesStream = require('../utils/send-files-stream')
const validateAddInput = require('ipfs-utils/src/files/add-input-validation')

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

    try {
      validateAddInput(_files)
    } catch (err) {
      return callback(err)
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
