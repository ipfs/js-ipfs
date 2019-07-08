'use strict'

const errCode = require('err-code')
const human = require('human-to-milliseconds')
const promisify = require('promisify-es6')
const assert = require('assert')

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
    // Assert options
    this._validateOptions(options)

    this._running = false

    this._contentRouting = libp2p.contentRouting
    this._blockstore = blockstore

    // handle options (config uses uppercase)
    const humanDelay = options.Delay || options.delay || '15s'
    const delay = human(humanDelay)
    const humanInterval = options.Interval || options.interval || '12h'
    const interval = human(humanInterval)
    const strategy = options.Strategy || options.strategy || 'all'

    this._options = {
      delay,
      interval,
      strategy
    }

    this.reprovider = new Reprovider(this._contentRouting, this._blockstore, this._options)

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

    // Start reprovider
    this.reprovider.start()
  }

  /**
   * Stop the provider
   * @returns {void}
   */
  stop () {
    this._running = false

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

  // Validate Provider options
  _validateOptions (options) {
    const delay = (options.Delay || options.delay)
    assert(delay && parseInt(delay) !== 0, '0 delay is not a valid value for reprovider')

    const interval = (options.Interval || options.interval)
    assert(interval && parseInt(interval) !== 0, '0 interval is not a valid value for reprovider')

    const strategy = (options.Strategy || options.strategy)
    assert(strategy && (strategy === 'all' || strategy === 'pinned' || strategy === 'roots'),
      'Reprovider must have one of the following strategies: `all`, `pinned` or `roots`')
  }
}

exports = module.exports = Provider
