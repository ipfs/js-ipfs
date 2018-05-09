'use strict'

const Key = require('interface-datastore').Key

module.exports = {
  FILE_SEPARATOR: '/',
  MFS_ROOT_KEY: new Key('/local/filesroot'),
  MAX_CHUNK_SIZE: 262144,
  MAX_LINKS: 174
}
