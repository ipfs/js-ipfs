'use strict'

const SendFilesStream = require('../utils/send-files-stream')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')
const toPull = require('stream-to-pull-stream')

module.exports = (send) => {
  return (options) => {
    options = options || {}
    options.converter = FileResultStreamConverter
    return toPull(SendFilesStream(send, 'add')({ qs: options }))
  }
}
