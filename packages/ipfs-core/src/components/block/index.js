'use strict'

const createGet = require('./get')
const createPut = require('./put')
const createRm = require('./rm')
const createStat = require('./stat')

/**
 * @typedef {import('../../types').Preload} Preload
 * @typedef {import('ipfs-block-service')} BlockService
 * @typedef {import('../gc-lock').GCLock} GCLock
 * @typedef {import('ipfs-core-types/src/pin').API} Pin
 * @typedef {import('../pin/pin-manager')} PinManager
 */

class BlockAPI {
  /**
   * @param {Object} config
   * @param {Preload} config.preload
   * @param {BlockService} config.blockService
   * @param {GCLock} config.gcLock
   * @param {Pin} config.pin
   * @param {PinManager} config.pinManager
   */
  constructor ({ blockService, preload, gcLock, pinManager, pin }) {
    this.get = createGet({ blockService, preload })
    this.put = createPut({ blockService, preload, gcLock, pin })
    this.rm = createRm({ blockService, gcLock, pinManager })
    this.stat = createStat({ blockService, preload })
  }
}

module.exports = BlockAPI
