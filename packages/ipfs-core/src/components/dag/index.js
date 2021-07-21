'use strict'

const createGet = require('./get')
const createResolve = require('./resolve')
const createPut = require('./put')

class DagAPI {
  /**
   * @param {Object} config
   * @param {import('ipfs-core-utils/src/multihashes')} config.hashers
   * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
   * @param {import('../../types').Preload} config.preload
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   */
  constructor ({ repo, codecs, hashers, preload }) {
    this.get = createGet({ codecs, repo, preload })
    this.resolve = createResolve({ repo, codecs, preload })
    this.put = createPut({ repo, codecs, hashers, preload })
  }
}

module.exports = DagAPI
