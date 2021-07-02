'use strict'

const createExport = require('./export')
const createGet = require('./get')
const createImport = require('./import')
const createPut = require('./put')
const createResolve = require('./resolve')
const createTree = require('./tree')

/**
 * @typedef {Object} ReaderConfig
 * @property {IPLD} ipld
 * @property {Preload} preload
 *
 * @typedef {import('ipfs-block-service')} BlockService
 * @typedef {import('ipld')} IPLD
 * @typedef {import('../../types').Preload} Preload
 * @typedef {import('ipfs-core-types/src/pin').API} Pin
 * @typedef {import('../gc-lock').GCLock} GCLock
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

class DagAPI {
  /**
   * @param {Object} config
   * @param {BlockService} config.blockService
   * @param {IPLD} config.ipld
   * @param {Preload} config.preload
   * @param {Pin} config.pin
   * @param {GCLock} config.gcLock
   */
  constructor ({ blockService, ipld, pin, preload, gcLock }) {
    console.error('DagAPI')
    this.export = createExport({ blockService, preload })
    this.get = createGet({ ipld, preload })
    this.import = createImport({ blockService, gcLock, pin })
    this.put = createPut({ ipld, preload, pin, gcLock })
    this.resolve = createResolve({ ipld, preload })
    this.tree = createTree({ ipld, preload })
  }
}

module.exports = DagAPI
