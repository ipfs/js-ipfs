'use strict'

const createAdd = require('./add')
const createAddAll = require('./add-all')
const createLs = require('./ls')
const createRm = require('./rm')
const createRmAll = require('./rm-all')

/**
 * @typedef {import('../gc-lock').GCLock} GCLock
 * @typedef {import('./pin-manager')} PinManager
 */

class PinAPI {
  /**
   * @param {Object} config
   * @param {GCLock} config.gcLock
   * @param {import('ipld')} config.ipld
   * @param {PinManager} config.pinManager
   */
  constructor ({ gcLock, ipld, pinManager }) {
    const addAll = createAddAll({ gcLock, ipld, pinManager })
    this.addAll = addAll
    this.add = createAdd({ addAll })
    const rmAll = createRmAll({ gcLock, ipld, pinManager })
    this.rmAll = rmAll
    this.rm = createRm({ rmAll })
    this.ls = createLs({ ipld, pinManager })

    /** @type {import('ipfs-core-types/src/pin/remote').API} */
    this.remote = {
      add: (cid, options = {}) => Promise.reject(new Error('Not implemented')),
      ls: async function * (query, options = {}) { return Promise.reject(new Error('Not implemented')) }, // eslint-disable-line require-yield
      rm: (query, options = {}) => Promise.reject(new Error('Not implemented')),
      rmAll: (query, options = {}) => Promise.reject(new Error('Not implemented')),
      service: {
        add: (name, credentials) => Promise.reject(new Error('Not implemented')),
        rm: (name, options = {}) => Promise.reject(new Error('Not implemented')),
        ls: (options = {}) => Promise.reject(new Error('Not implemented'))
      }
    }
  }
}

module.exports = PinAPI
