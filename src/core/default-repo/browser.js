'use strict'

const idb = require('idb-plus-blob-store')
const IPFSRepo = require('ipfs-repo')

module.exports = () => {
  return new IPFSRepo('ipfs', {stores: idb})
}
