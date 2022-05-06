import { createAddLink } from './add-link.js'
import { createAppendData } from './append-data.js'
import { createRmLink } from './rm-link.js'
import { createSetData } from './set-data.js'

/**
 * @typedef {import('../../../types').Preload} Preload
 */

export class ObjectPatchAPI {
  /**
   * @param {object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {Preload} config.preload
   */
  constructor ({ repo, preload }) {
    this.addLink = createAddLink({ repo, preload })
    this.appendData = createAppendData({ repo, preload })
    this.rmLink = createRmLink({ repo, preload })
    this.setData = createSetData({ repo, preload })
  }
}
