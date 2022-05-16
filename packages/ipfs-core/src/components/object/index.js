import { createData } from './data.js'
import { createGet } from './get.js'
import { createLinks } from './links.js'
import { createNew } from './new.js'
import { createPut } from './put.js'
import { createStat } from './stat.js'
import { ObjectPatchAPI } from './patch/index.js'

/**
 * @typedef {import('../../types').Preload} Preload
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

export class ObjectAPI {
  /**
   * @param {object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
   * @param {Preload} config.preload
   */
  constructor ({ repo, codecs, preload }) {
    this.data = createData({ repo, preload })
    this.get = createGet({ repo, preload })
    this.links = createLinks({ repo, codecs })
    this.new = createNew({ repo, preload })
    this.put = createPut({ repo, preload })
    this.stat = createStat({ repo, preload })
    this.patch = new ObjectPatchAPI({ repo, preload })
  }
}
