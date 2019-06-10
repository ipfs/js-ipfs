'use strict'

const promisify = require('promisify-es6')
const WorkerQueue = require('./queue')

const { blockKeyToCid } = require('../utils')

// const initialDelay = 15000
const initialDelay = 3000

class Reprovider {
  /**
   * Reprovider goal is to reannounce blocks to the network.
   * @param {object} contentRouting
   * @param {Blockstore} blockstore
   * @param {object} options
   * @memberof Reprovider
   */
  constructor (contentRouting, blockstore, options) {
    this._contentRouting = contentRouting
    this._blockstore = blockstore
    this._options = options

    this._timeoutId = undefined
    this._worker = new WorkerQueue(this._provideBlock)
  }

  /**
   * Begin processing the reprovider work and waiting for reprovide triggers
   * @returns {void}
   */
  start () {
    // Start doing reprovides after the initial delay
    this._timeoutId = setTimeout(() => {
      this._runPeriodically()
    }, initialDelay)
  }

  /**
   * Stops the reprovider. Any active reprovide actions should be aborted
   * @returns {void}
   */
  stop () {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
      this._timeoutId = undefined
    }
    this._worker.stop()
  }

  /**
   * Run reprovide on every `options.interval` ms
   * @returns {void}
   */
  async _runPeriodically () {
    while (this._timeoutId) {
      const blocks = await promisify((callback) => this._blockstore.query({}, callback))()

      // TODO strategy logic here
      if (this._options.strategy === 'pinned') {

      } else if (this._options.strategy === 'pinned') {

      }

      await this._worker.execute(blocks)

      // Each subsequent walk should run on a `this._options.interval` interval
      await new Promise(resolve => {
        this._timeoutId = setTimeout(resolve, this._options.interval)
      })
    }
  }

  /**
   * Do the reprovide work to libp2p content routing
   * @param {Block} block
   * @returns {void}
   */
  async _provideBlock (block) {
    const cid = blockKeyToCid(block.key.toBuffer())

    await promisify((callback) => {
      this._contentRouting.provide(cid, callback)
    })()
  }
}

exports = module.exports = Reprovider
