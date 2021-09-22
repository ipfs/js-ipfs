
/* eslint-env browser */

import { DAGService } from './dag.js'
import { CoreService } from './core.js'
import { FilesService } from './files.js'
import { BlockService } from './block.js'

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 */

export class IPFSService {
  /**
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.dag = new DAGService(ipfs)
    this.core = new CoreService(ipfs)
    this.files = new FilesService(ipfs)
    this.block = new BlockService(ipfs)
  }
}
