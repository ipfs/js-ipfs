'use strict'

const createGet = require('./get')
const createResolve = require('./resolve')
const createTree = require('./tree')
const createPut = require('./put')

class Reader {
  /**
   * @param {ReaderConfig} config
   */
  constructor (config) {
    this.get = createGet(config)
    this.resolve = createResolve(config)
    this.tree = createTree(config)
  }
}

class DagAPI {
  /**
   * @param {Object} config
   * @param {IPLD} config.ipld
   * @param {Preload} config.preload
   * @param {Pin} config.pin
   * @param {GCLock} config.gcLock
   * @param {DagReader} config.dagReader
   */
  constructor ({ ipld, pin, preload, gcLock, dagReader }) {
    const { get, resolve, tree } = dagReader
    const put = createPut({ ipld, preload, pin, gcLock })

    this.get = get
    this.resolve = resolve
    this.tree = tree
    this.put = put
  }

  /**
   * Creates a reader part of the DAG API. This allows other APIs that require
   * reader parts of the DAG API to be instantiated before components required
   * by writer end are.
   *
   * @param {ReaderConfig} config
   * @returns {DagReader}
   */
  static reader (config) {
    return new Reader(config)
  }
}

module.exports = DagAPI

/**
 * @typedef {Object} DagReader
 * @property {ReturnType<typeof createGet>} get
 * @property {ReturnType<typeof createResolve>} resolve
 * @property {ReturnType<typeof createTree>} tree
 *
 * @typedef {Object} ReaderConfig
 * @property {IPLD} ipld
 * @property {Preload} preload
 *
 * @typedef {import('..').IPLD} IPLD
 * @typedef {import('..').Preload} Preload
 * @typedef {import('..').Pin} Pin
 * @typedef {import('..').GCLock} GCLock
 * @typedef {import('..').CID} CID
 * @typedef {import('..').AbortOptions} AbortOptions
 */
