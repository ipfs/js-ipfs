'use strict'

const SendFilesStream = require('../utils/send-files-stream')
const FileResultStreamConverter = require('../utils/file-result-stream-converter')

module.exports = (send) => {
  return async function * (source, options) {
    options = options || {}
    options.converter = FileResultStreamConverter

    const stream = SendFilesStream(send, 'add')(options)

    for await (const entry of source) {
      stream.write(entry)
    }

    stream.end()

    for await (const entry of stream) {
      yield entry
    }
  }
}
