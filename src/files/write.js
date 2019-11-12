'use strict'

const promisify = require('promisify-es6')
const concatStream = require('concat-stream')
const once = require('once')
const SendFilesStream = require('../utils/send-files-stream')

module.exports = (send) => {
  const sendFilesStream = SendFilesStream(send, 'files/write')

  return promisify((pathDst, _files, opts, _callback) => {
    if (typeof opts === 'function' &&
      !_callback) {
      _callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' &&
      typeof _callback === 'function') {
      _callback = opts
      opts = {}
    }

    const files = [].concat(_files)
    const callback = once(_callback)

    const options = {
      args: pathDst,
      qs: opts
    }

    const stream = sendFilesStream({ qs: options })
    const concat = concatStream((result) => callback(null, result))
    stream.once('error', callback)
    stream.pipe(concat)

    files.forEach((file) => stream.write(file))
    stream.end()
  })
}
