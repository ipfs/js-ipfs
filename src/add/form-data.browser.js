'use strict'
/* eslint-env browser */

const { Buffer } = require('buffer')
const normaliseInput = require('ipfs-utils/src/files/normalise-input')

exports.toFormData = async input => {
  const files = normaliseInput(input)
  const formData = new FormData()
  let i = 0

  for await (const file of files) {
    if (file.content) {
      // In the browser there's _currently_ no streaming upload, buffer up our
      // async iterator chunks and append a big Blob :(
      // One day, this will be browser streams
      const bufs = []
      for await (const chunk of file.content) {
        bufs.push(Buffer.isBuffer(chunk) ? chunk.buffer : chunk)
      }

      formData.append(`file-${i}`, new Blob(bufs, { type: 'application/octet-stream' }), file.path)
    } else {
      formData.append(`dir-${i}`, new Blob([], { type: 'application/x-directory' }), file.path)
    }

    i++
  }

  return formData
}
