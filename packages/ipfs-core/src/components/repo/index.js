import { createGc } from './gc.js'
import { createStat } from './stat.js'
import { createVersion } from './version.js'

/**
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('ipfs-core-utils/multihashes').Multihashes} Multihashes
 */

export class RepoAPI {
  /**
   * @param {object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {Multihashes} config.hashers
   */
  constructor ({ repo, hashers }) {
    this.gc = createGc({ repo, hashers })
    this.stat = createStat({ repo })
    this.version = createVersion({ repo })

    /**
     * @param {string} addr
     */
    this.setApiAddr = (addr) => repo.apiAddr.set(addr)
  }
}
