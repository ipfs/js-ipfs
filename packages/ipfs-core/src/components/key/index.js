import { createExport } from './export.js'
import { createGen } from './gen.js'
import { createImport } from './import.js'
import { createInfo } from './info.js'
import { createList } from './list.js'
import { createRename } from './rename.js'
import { createRm } from './rm.js'

/**
 * @typedef {import('@libp2p/interface-keychain').KeyChain} Keychain
 */

export class KeyAPI {
  /**
   * @param {object} config
   * @param {Keychain} config.keychain
   */
  constructor ({ keychain }) {
    this.gen = createGen({ keychain })
    this.list = createList({ keychain })
    this.rm = createRm({ keychain })
    this.rename = createRename({ keychain })
    this.export = createExport({ keychain })
    this.import = createImport({ keychain })
    this.info = createInfo({ keychain })
  }
}
