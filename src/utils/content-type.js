'use strict'

const fileType = require('file-type')
const mime = require('mime-types')
const Reader = require('it-reader')

const detectContentType = async (path, source) => {
  let fileSignature

  // try to guess the filetype based on the first bytes
  // note that `file-type` doesn't support svgs, therefore we assume it's a svg if path looks like it
  if (!path.endsWith('.svg')) {
    try {
      const reader = Reader(source)
      const { value, done } = await reader.next(fileType.minimumBytes)

      if (done) return { source: reader }

      fileSignature = fileType(value.slice())

      source = (async function * () { // eslint-disable-line require-await
        yield value
        yield * reader
      })()
    } catch (err) {
      if (err.code !== 'ERR_UNDER_READ') throw err

      // not enough bytes for sniffing, just yield the data
      source = (async function * () { // eslint-disable-line require-await
        yield err.buffer // these are the bytes that were read (if any)
      })()
    }
  }

  // if we were unable to, fallback to the `path` which might contain the extension
  const mimeType = mime.lookup(fileSignature ? fileSignature.ext : path)

  return { source, contentType: mime.contentType(mimeType) }
}

module.exports = detectContentType
