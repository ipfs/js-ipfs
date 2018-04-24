'use strict'

const {
  FILE_SEPARATOR
} = require('./constants')

const validatePath = (path) => {
  path = (path || '').trim()

  if (!path) {
    throw new Error('paths must not be empty')
  }

  if (path.substring(0, 1) !== FILE_SEPARATOR) {
    throw new Error(`paths must start with a leading ${FILE_SEPARATOR}`)
  }

  if (path.substring(path.length - FILE_SEPARATOR.length) === FILE_SEPARATOR) {
    path = path.substring(0, path.length - FILE_SEPARATOR.length)
  }

  return path
}

module.exports = validatePath
