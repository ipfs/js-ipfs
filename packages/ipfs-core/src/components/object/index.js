'use strict'

const createData = require('./data')
const createGet = require('./get')
const createLinks = require('./links')
const createNew = require('./new')
const createPut = require('./put')
const createStat = require('./stat')
const ObjectPatchAPI = require('./patch')

/**
 * @typedef {import('ipld')} IPLD
 * @typedef {import('../../types').Preload} Preload
 * @typedef {import('../gc-lock').GCLock} GCLock
 * @typedef {import('cids')} CID
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

class ObjectAPI {
  /**
   * @param {Object} config
   * @param {IPLD} config.ipld
   * @param {Preload} config.preload
   * @param {GCLock} config.gcLock
   */
  constructor ({ ipld, preload, gcLock }) {
    this.data = createData({ ipld, preload })
    this.get = createGet({ ipld, preload })
    this.links = createLinks({ ipld })
    this.new = createNew({ ipld, preload })
    this.put = createPut({ ipld, preload, gcLock })
    this.stat = createStat({ ipld, preload })
    this.patch = new ObjectPatchAPI({ ipld, preload, gcLock })
  }
}

module.exports = ObjectAPI
