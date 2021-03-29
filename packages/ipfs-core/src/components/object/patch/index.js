'use strict'

const createAddLink = require('./add-link')
const createAppendData = require('./append-data')
const createRmLink = require('./rm-link')
const createSetData = require('./set-data')

/**
 * @typedef {import('ipld')} IPLD
 * @typedef {import('../../../types').Preload} Preload
 * @typedef {import('..').GCLock} GCLock
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

class ObjectPatchAPI {
  /**
   * @param {Object} config
   * @param {IPLD} config.ipld
   * @param {Preload} config.preload
   * @param {GCLock} config.gcLock
   */
  constructor ({ ipld, preload, gcLock }) {
    this.addLink = createAddLink({ ipld, preload, gcLock })
    this.appendData = createAppendData({ ipld, preload, gcLock })
    this.rmLink = createRmLink({ ipld, preload, gcLock })
    this.setData = createSetData({ ipld, preload, gcLock })
  }
}
module.exports = ObjectPatchAPI
