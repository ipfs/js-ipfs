'use strict'

const createExport = require('./export')
const createGet = require('./get')
const createImport = require('./import')
const createPut = require('./put')
const createResolve = require('./resolve')

class DagAPI {
  /**
   * @param {Object} config
   * @param {import('ipfs-core-utils/src/multihashes')} config.hashers
   * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
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

module.exports = DagAPI
