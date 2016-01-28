'use strict'

const localStorage = require('idb-plus-blob-store')
const IPFSRepo = require('ipfs-repo')

const options = {
  stores: {
    keys: localStorage,
    config: localStorage,
    datastore: localStorage,
    // datastoreLegacy: needs https://github.com/ipfs/js-ipfs-repo/issues/6#issuecomment-164650642
    logs: localStorage,
    locks: localStorage,
    version: localStorage
  }
}

module.exports = () => {
  return new IPFSRepo('ipfs', options)
}
