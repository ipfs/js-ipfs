'use strict'

const createGC = require('./gc')
const createStat = require('./stat')
const createVersion = require('./version')

/**
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('ipfs-core-utils/src/multihashes')} Multihashes
 */

class RepoAPI {
  /**
   * @param {Object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {Multihashes} config.hashers
   */
  constructor ({ repo, hashers }) {
    this.gc = createGC({ repo, hashers })
    this.stat = createStat({ repo })
    this.version = createVersion({ repo })

    /**
     * @param {string} addr
     */
    this.setApiAddr = (addr) => repo.apiAddr.set(addr)
  }
}
module.exports = RepoAPI
