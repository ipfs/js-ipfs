import { createAdd } from './add.js'
import { createClear } from './clear.js'
import { createList } from './list.js'
import { createReset } from './reset.js'
import { createRm } from './rm.js'
export class BootstrapAPI {
  /**
   * @param {object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   */
  constructor ({ repo }) {
    this.add = createAdd({ repo })
    this.list = createList({ repo })
    this.rm = createRm({ repo })
    this.clear = createClear({ repo })
    this.reset = createReset({ repo })
  }
}
