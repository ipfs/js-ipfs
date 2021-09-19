import { createData } from './data.js'
import { createGet } from './get.js'
import { createLinks } from './links.js'
import { createNew } from './new.js'
import { createPut } from './put.js'
import { createStat } from './stat.js'
import { PatchAPI } from './patch/index.js'

export class ObjectAPI {
  /**
   * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
   * @param {import('../types').Options} config
   */
  constructor (codecs, config) {
    this.data = createData(config)
    this.get = createGet(config)
    this.links = createLinks(config)
    this.new = createNew(config)
    this.put = createPut(codecs, config)
    this.stat = createStat(config)
    this.patch = new PatchAPI(config)
  }
}
