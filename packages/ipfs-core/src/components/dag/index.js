'use strict'

const createExport = require('./export')
const createGet = require('./get')
const createResolve = require('./resolve')
const createTree = require('./tree')
const createPut = require('./put')

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
    this.export = createExport({ blockService, preload })
    this.get = createGet({ ipld, preload })
    this.resolve = createResolve({ ipld, preload })
    this.tree = createTree({ ipld, preload })
    this.put = createPut({ ipld, preload, pin, gcLock })
  }
}

module.exports = DagAPI
