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

    const notImplemented = () => Promise.reject(new Error('Not implemented'))

    this.remote = {
      add: notImplemented,
      ls: notImplemented,
      rm: notImplemented,
      rmAll: notImplemented,
      service: {
        add: notImplemented,
        rm: notImplemented,
        ls: notImplemented
      }
    }
  }
}

module.exports = PinAPI
