import { createGet } from './get.js'
import { createPut } from './put.js'
import { createRm } from './rm.js'
import { createStat } from './stat.js'

/**
 * @typedef {import('../../types').Preload} Preload
 */

export class BlockAPI {
  /**
   * @param {object} config
   * @param {import('ipfs-core-utils/src/multihashes').Multihashes} config.hashers
   * @param {import('ipfs-core-utils/src/multicodecs').Multicodecs} config.codecs
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
