'use strict'

const createData = require('./data')
const createGet = require('./get')
const createLinks = require('./links')
const createNew = require('./new')
const createPut = require('./put')
const createStat = require('./stat')
const ObjectPatchAPI = require('./patch')

class ObjectAPI {
  /**
   * @param {Object} config
   * @param {IPLD} config.ipld
   * @param {Preload} config.preload
   * @param {GCLock} config.gcLock
   * @param {Dag} config.dag
   */
  constructor ({ ipld, preload, dag, gcLock }) {
    this.data = createData({ ipld, preload })
    this.get = createGet({ ipld, preload })
    this.links = createLinks({ dag })
    this.new = createNew({ ipld, preload })
    this.put = createPut({ ipld, preload, gcLock })
    this.stat = createStat({ ipld, preload })
    this.patch = new ObjectPatchAPI({ ipld, preload, gcLock })
  }
}

module.exports = ObjectAPI

/**
 * @typedef {import('..').IPLD} IPLD
 * @typedef {import('..').Preload} Preload
 * @typedef {import('..').GCLock} GCLock
 * @typedef {import('..').Dag} Dag
 * @typedef {import('..').CID} CID
 * @typedef {import('..').AbortOptions} AbortOptions
 */
