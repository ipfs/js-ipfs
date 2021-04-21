'use strict'

const createGC = require('./gc')
const createStat = require('./stat')
const createVersion = require('./version')

class RepoAPI {
  /**
   * @param {Object} config
   * @param {import('../gc-lock').GCLock} config.gcLock
   * @param {import('ipfs-core-types/src/pin').API} config.pin
   * @param {import('ipfs-repo')} config.repo
   * @param {import('ipfs-core-types/src/refs').API["refs"]} config.refs
   */
  constructor ({ gcLock, pin, repo, refs }) {
    this.gc = createGC({ gcLock, pin, refs, repo })
    this.stat = createStat({ repo })
    this.version = createVersion({ repo })
  }
}
module.exports = RepoAPI
