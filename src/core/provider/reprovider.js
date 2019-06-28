'use strict'

const promisify = require('promisify-es6')
const WorkerQueue = require('./queue')

const { blockKeyToCid } = require('../utils')

class Reprovider {
  /**
   * Reprovider goal is to reannounce blocks to the network.
   * @param {object} contentRouting
   * @param {Blockstore} blockstore
   * @param {object} options
   * @param {string} options.delay reprovider initial delay in human friendly time
   * @param {string} options.interval reprovider interval in human friendly time
   * @param {string} options.strategy reprovider strategy
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
    }, this._options.delay)
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
   * Run reprovide on every `options.interval` ms recursively
   * @returns {void}
   */
  async _runPeriodically () {
    // Verify if stopped
    if (!this._timeoutId) return

    // TODO strategy logic here
    const blocks = await promisify((callback) => this._blockstore.query({}, callback))()

    if (this._options.strategy === 'pinned') {

    } else if (this._options.strategy === 'pinned') {

    }

    // Verify if stopped
    if (!this._timeoutId) return

    await this._worker.execute(blocks)

    // Verify if stopped
    if (!this._timeoutId) return

    // Each subsequent walk should run on a `this._options.interval` interval
    this._timeoutId = setTimeout(() => {
      this._runPeriodically()
    }, this._options.interval)
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
