import { createExport } from './export.js'
import { createGet } from './get.js'
import { createImport } from './import.js'
import { createPut } from './put.js'
import { createResolve } from './resolve.js'

export class DagAPI {
  /**
   * @param {object} config
   * @param {import('ipfs-core-utils/multihashes').Multihashes} config.hashers
   * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
   * @param {import('../../types').Preload} config.preload
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   */
  constructor ({ repo, codecs, hashers, preload }) {
    this.export = createExport({ repo, preload, codecs })
    this.get = createGet({ codecs, repo, preload })
    this.import = createImport({ repo })
    this.resolve = createResolve({ repo, codecs, preload })
    this.put = createPut({ repo, codecs, hashers, preload })
  }
}
