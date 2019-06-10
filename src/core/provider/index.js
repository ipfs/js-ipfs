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
   * @param {Libp2p} libp2p
   * @param {Blockstore} blockstore
   * @param {object} options
   * @memberof Provider
   */
  constructor (libp2p, blockstore, options) {
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

    // handle options
    const strategy = this._options.strategy || 'all'
    const humanInterval = this._options.Interval || '12h'
    const interval = await promisify((callback) => human(humanInterval, callback))()
    const options = {
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
   * Announce block to the network and add and entry to the tracker
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
