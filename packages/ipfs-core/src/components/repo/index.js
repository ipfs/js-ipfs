'use strict'

const createGC = require('./gc')
const createStat = require('./stat')
const createVersion = require('./version')

class RepoAPI {
  /**
   * @param {Object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   */
  constructor ({ repo }) {
    this.gc = createGC({ repo })
    this.stat = createStat({ repo })
    this.version = createVersion({ repo })

    /**
     * @param {string} addr
     */
    this.setApiAddr = (addr) => repo.apiAddr.set(addr)
  }
}
module.exports = RepoAPI
