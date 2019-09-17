'use strict'

const FormData = require('form-data')
const { Buffer } = require('buffer')
const toStream = require('it-to-stream')
const normaliseInput = require('ipfs-utils/src/files/normalise-input')
const { isElectronRenderer } = require('ipfs-utils/src/env')

exports.toFormData = async input => {
  const files = normaliseInput(input)
  const formData = new FormData()
  let i = 0

  for await (const file of files) {
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
          knownLength: file.content.length // Send Content-Length header if known
        }
      )
    } else {
      formData.append(`dir-${i}`, Buffer.alloc(0), {
        filepath: encodeURIComponent(file.path),
        contentType: 'application/x-directory'
      })
    }

    i++
  }

  return formData
}

// TODO remove this when upstream fix for ky-universal is merged
// https://github.com/sindresorhus/ky-universal/issues/9
// also this should only be necessary when nodeIntegration is false in electron renderer
if (isElectronRenderer) {
  exports.toFormData = require('./form-data.browser').toFormData
}
