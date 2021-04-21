'use strict'

const createGet = require('./get')
const createResolve = require('./resolve')
const createTree = require('./tree')
const createPut = require('./put')

/**
 * @typedef {Object} ReaderConfig
 * @property {IPLD} ipld
 * @property {Preload} preload
 *
 * @typedef {import('ipld')} IPLD
 * @typedef {import('../../types').Preload} Preload
 * @typedef {import('ipfs-core-types/src/pin').API} Pin
 * @typedef {import('../gc-lock').GCLock} GCLock
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

class DagAPI {
  /**
   * @param {Object} config
   * @param {IPLD} config.ipld
   * @param {Preload} config.preload
   * @param {Pin} config.pin
   * @param {GCLock} config.gcLock
   */
  constructor ({ ipld, pin, preload, gcLock }) {
    this.get = createGet({ ipld, preload })
    this.resolve = createResolve({ ipld, preload })
    this.tree = createTree({ ipld, preload })
    this.put = createPut({ ipld, preload, pin, gcLock })
  }
}

module.exports = DagAPI
