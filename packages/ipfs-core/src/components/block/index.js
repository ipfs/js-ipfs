'use strict'

const createGet = require('./get')
const createPut = require('./put')
const createRm = require('./rm')
const createStat = require('./stat')

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

/**
 * @typedef {import('..').Preload} Preload
 * @typedef {import('..').BlockService} BlockService
 * @typedef {import('..').GCLock} GCLock
 * @typedef {import('..').Pin} Pin
 * @typedef {import('..').PinManager} PinManager
 * @typedef {import('..').AbortOptions} AbortOptions
 * @typedef {import('..').CID} CID
 * @typedef {import('..').IPLDBlock} IPLDBlock
 */
