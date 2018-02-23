'use strict'

const SendFilesStream = require('../utils/send-files-stream')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')

module.exports = (send) => {
  return (options) => {
    options = options || {}
    options.converter = FileResultStreamConverter
    return SendFilesStream(send, 'add')(options)
  }
}
