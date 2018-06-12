'use strict'

const {
  FILE_SEPARATOR
} = require('./constants')

const IPFS_PREFIX = '/ipfs'

const validatePath = (path, callback) => {
  path = (path || '').trim()

  if (!path) {
    return callback(new Error('paths must not be empty'))
  }

  if (path.substring(0, 1) !== FILE_SEPARATOR) {
    return callback(new Error(`paths must start with a leading ${FILE_SEPARATOR}`))
  }

  if (path.substring(path.length - FILE_SEPARATOR.length) === FILE_SEPARATOR) {
    path = path.substring(0, path.length - FILE_SEPARATOR.length)
  }

  const parts = path
    .split(FILE_SEPARATOR)
    .filter(Boolean)
  const name = parts.pop()
  const directory = `${FILE_SEPARATOR}${parts.join(FILE_SEPARATOR)}`

  if (path.substring(0, IPFS_PREFIX.length) === IPFS_PREFIX) {
    return callback(null, {
      type: 'ifps',
      path: path.substring(IPFS_PREFIX.length + 1),
      directory,
      name
    })
  }

  callback(null, {
    type: 'mfs',
    path: path || FILE_SEPARATOR,
    directory,
    name
  })
}

module.exports = validatePath
