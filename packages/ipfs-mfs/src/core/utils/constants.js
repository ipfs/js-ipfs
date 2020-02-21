'use strict'

const Key = require('interface-datastore').Key

const FILE_TYPES = {
  file: 0,
  directory: 1,
  'hamt-sharded-directory': 1
}

module.exports = {
  FILE_SEPARATOR: '/',
  MFS_ROOT_KEY: new Key('/local/filesroot'),
  MAX_CHUNK_SIZE: 262144,
  MAX_LINKS: 174,
  FILE_TYPES
}
