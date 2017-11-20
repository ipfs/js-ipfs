'use strict'

const once = require('once')
const ConcatStream = require('concat-stream')
const SendFilesStream = require('./send-files-stream')

module.exports = (send, path) => {
  const sendFilesStream = SendFilesStream(send, path)
  return (file, options, _callback) => {
    const callback = once(_callback)
    const stream = sendFilesStream(options)
    const concat = ConcatStream((results) => callback(null, results))
    stream.once('error', callback)
    stream.pipe(concat)
    stream.write(file)
    stream.end()
  }
}
