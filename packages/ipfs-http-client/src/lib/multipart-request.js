'use strict'

const normaliseInput = require('ipfs-utils/src/files/normalise-input')
const toStream = require('it-to-stream')
const hat = require('hat')
const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')

function multipartRequest (source, boundary = `-----------------------------${hat()}`) {
  return {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: toStream.readable(async function * () {
      try {
        let index = 0

        for await (const { content, path, mode, mtime } of normaliseInput(source)) {
          if (index > 0) {
            yield '\r\n'
          }

          yield `--${boundary}\r\n`
          yield `Content-Disposition: file; name="file-${index}"; filename="${encodeURIComponent(path)}"\r\n`
          yield `Content-Type: ${content ? 'application/octet-stream' : 'application/x-directory'}\r\n`

          if (mode != null) {
            yield `mode: ${modeToString(mode)}\r\n`
          }

          if (mtime != null) {
            const {
              secs, nsecs
            } = mtimeToObject(mtime)

            yield `mtime: ${secs}\r\n`

            if (nsecs != null) {
              yield `mtime-nsecs: ${nsecs}\r\n`
            }
          }

          yield '\r\n'

          if (content) {
            yield * content
          }

          index++
        }
      } finally {
        yield `\r\n--${boundary}--\r\n`
      }
    }())
  }
}

module.exports = multipartRequest
