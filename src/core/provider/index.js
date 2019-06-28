'use strict'

const errCode = require('err-code')
const human = require('human-to-milliseconds')
const promisify = require('promisify-es6')

const CID = require('cids')

const Reprovider = require('./reprovider')

class Provider {
  /**
   * Provider goal is to announce blocks to the network.
   * It keeps track of which blocks are provided, and allow them to be reprovided
   * @param {Libp2p} libp2p libp2p instance
   * @param {Blockstore} blockstore blockstore instance
   * @param {object} options reprovider options
   * @param {string} options.delay reprovider initial delay in human friendly time
   * @param {string} options.interval reprovider interval in human friendly time
   * @param {string} options.strategy reprovider strategy
   */
  constructor (libp2p, blockstore, options = {}) {
    this._running = false

    this._contentRouting = libp2p.contentRouting
    this._blockstore = blockstore
    this._options = options
    this.reprovider = undefined
  }

  /**
   * Begin processing the provider work
   * @returns {void}
   */
  async start () {
    // do not run twice
    if (this._running) {
      return
    }

    this._running = true

    // handle options (config uses uppercase)
    const humanDelay = this._options.Delay || this._options.delay || '15s'
    const delay = await human(humanDelay)
    const humanInterval = this._options.Interval || this._options.interval || '12h'
    const interval = await human(humanInterval)
    const strategy = this._options.Strategy || this._options.strategy || 'all'
    const options = {
      delay,
      interval,
      strategy
    }

    this.reprovider = new Reprovider(this._contentRouting, this._blockstore, options)

    // Start reprovider
    this.reprovider.start()
  }

  /**
   * Stop the provider
   * @returns {void}
   */
  stop () {
    this._running = true

    // stop the reprovider
    this.reprovider.stop()
  }

  /**
   * Announce block to the network
   * Takes a cid and makes an attempt to announce it to the network
   * @param {CID} cid
   */
  async provide (cid) {
    if (!CID.isCID(cid)) {
      throw errCode('invalid CID to provide', 'ERR_INVALID_CID')
    }

    await promisify((callback) => {
      this._contentRouting.provide(cid, callback)
    })()
  }

  /**
   * Find providers of a block in the network
   * @param {CID} cid cid of the block
   * @param {object} options
   * @param {number} options.timeout - how long the query should maximally run, in ms (default: 60000)
   * @param {number} options.maxNumProviders - maximum number of providers to find
   * @returns {Promise}
   */
  async findProviders (cid, options) { // eslint-disable-line require-await
    if (!CID.isCID(cid)) {
      throw errCode('invalid CID to find', 'ERR_INVALID_CID')
    }

    return promisify((callback) => {
      this._contentRouting.findProviders(cid, options, callback)
    })()
  }
}

exports = module.exports = Provider
