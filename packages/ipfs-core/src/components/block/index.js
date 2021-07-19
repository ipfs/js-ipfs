'use strict'

const createGet = require('./get')
const createPut = require('./put')
const createRm = require('./rm')
const createStat = require('./stat')

/**
 * @typedef {import('../../types').Preload} Preload
 */

class BlockAPI {
  /**
   * @param {Object} config
   * @param {import('ipfs-core-utils/src/multihashes')} config.hashers
   * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
   * @param {Preload} config.preload
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   */
  constructor ({ codecs, hashers, preload, repo }) {
    this.get = createGet({ preload, repo })
    this.put = createPut({ codecs, hashers, preload, repo })
    this.rm = createRm({ repo })
    this.stat = createStat({ preload, repo })
  }
}

module.exports = BlockAPI
