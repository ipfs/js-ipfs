'use strict'

const FormData = require('form-data')
const { Buffer } = require('buffer')
const toStream = require('it-to-stream')
const normaliseInput = require('ipfs-utils/src/files/normalise-input')
const mtimeToObject = require('../lib/mtime-to-object')

exports.toFormData = async input => {
  const files = normaliseInput(input)
  const formData = new FormData()
  let i = 0

  for await (const file of files) {
    const headers = {}

    if (file.mtime !== undefined && file.mtime !== null) {
      const mtime = mtimeToObject(file.mtime)

      if (mtime) {
        headers.mtime = mtime.secs
        headers['mtime-nsecs'] = mtime.nsecs
      }
    }

    if (file.mode !== undefined && file.mode !== null) {
      headers.mode = file.mode.toString(8).padStart(4, '0')
    }

    if (file.content) {
      // In Node.js, FormData can be passed a stream so no need to buffer
      formData.append(
        `file-${i}`,
        // FIXME: add a `path` property to the stream so `form-data` doesn't set
        // a Content-Length header that is only the sum of the size of the
        // header/footer when knownLength option (below) is null.
        Object.assign(
          toStream.readable(file.content),
          { path: file.path || `file-${i}` }
        ),
        {
          filepath: encodeURIComponent(file.path),
          contentType: 'application/octet-stream',
          knownLength: file.content.length, // Send Content-Length header if known
          header: headers
        }
      )
    } else {
      formData.append(`dir-${i}`, Buffer.alloc(0), {
        filepath: encodeURIComponent(file.path),
        contentType: 'application/x-directory',
        header: headers
      })
    }

    i++
  }

  return formData
}
