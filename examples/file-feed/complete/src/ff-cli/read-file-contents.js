'use strict'

const fs = require('fs')
const mime = require('mime')

module.exports = function readFileContents (filePath) {
  let content

  try {
    content = fs.readFileSync(filePath)
  } catch (err) { throw err }

  return {
    content: content,
    mime: mime.lookup(filePath)
  }
}
