
import { createExport } from './export.js'
import { createGet } from './get.js'
import { createImport } from './import.js'
import { createPut } from './put.js'
import { createResolve } from './resolve.js'
export class DAGAPI {
  /**
   * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
   * @param {import('../types').Options} config
   */
  constructor (codecs, config) {
    this.export = createExport(config)
    this.get = createGet(codecs, config)
    this.import = createImport(config)
    this.put = createPut(codecs, config)
    this.resolve = createResolve(config)
  }
}
