import { createExport } from './export.js'
import { createGen } from './gen.js'
import { createImport } from './import.js'
import { createInfo } from './info.js'
import { createList } from './list.js'
import { createRename } from './rename.js'
import { createRm } from './rm.js'

export class KeyAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.export = createExport(config)
    this.gen = createGen(config)
    this.import = createImport(config)
    this.info = createInfo(config)
    this.list = createList(config)
    this.rename = createRename(config)
    this.rm = createRm(config)
  }
}
