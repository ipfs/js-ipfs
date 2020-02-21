'use strict'

const toCamel = require('./object-to-camel')

function toCamelWithMetadata (entry) {
  const file = toCamel(entry)

  if (Object.prototype.hasOwnProperty.call(file, 'mode')) {
    file.mode = parseInt(file.mode, 8)
  }

  if (Object.prototype.hasOwnProperty.call(file, 'mtime')) {
    file.mtime = {
      secs: file.mtime,
      nsecs: file.mtimeNsecs || 0
    }

    delete file.mtimeNsecs
  }

  return file
}

module.exports = toCamelWithMetadata
