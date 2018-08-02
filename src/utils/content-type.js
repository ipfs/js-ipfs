'use strict'

const fileType = require('file-type')
const mime = require('mime-types')

const detectContentType = (path, chunk) => {
  let fileSignature

  // try to guess the filetype based on the first bytes
  // note that `file-type` doesn't support svgs, therefore we assume it's a svg if path looks like it
  if (!path.endsWith('.svg')) {
    fileSignature = fileType(chunk)
  }

  // if we were unable to, fallback to the `path` which might contain the extension
  const mimeType = mime.lookup(fileSignature ? fileSignature.ext : path)

  return mime.contentType(mimeType)
}

module.exports = detectContentType
