'use strict'

const queue = require('async/queue')

const debug = require('debug')
const log = debug('ipfs:provider')
log.error = debug('ipfs:provider:error')

class WorkerQueue {
  /**
   * Creates an instance of a WorkerQueue.
   * @param {function} executeWork
   * @param {number} [concurrency=3]
   */
  constructor (executeWork, concurrency = 3) {
    this.executeWork = executeWork
    this._concurrency = concurrency

    this.running = false
    this.queue = this._setupQueue()
  }

  /**
   * Create the underlying async queue.
   * @returns {queue}
   */
  _setupQueue () {
    const q = queue(async (block) => {
      await this._processNext(block)
    }, this._concurrency)

    // If there is an error, stop the worker
    q.error = (err) => {
      log.error(err)
      this.stop(err)
    }

    q.buffer = 0

    return q
  }

  /**
   * Use the queue from async to keep `concurrency` amount items running
   * @param {Block[]} blocks
   * @returns {Promise}
   */
  async execute (blocks) {
    this.running = true

    // store the promise resolution functions to be resolved at end of queue
    this.execution = {}
    const execPromise = new Promise((resolve, reject) => Object.assign(this.execution, { resolve, reject }))

    // When all blocks have been processed, stop the worker
    this.queue.drain = () => {
      log('queue:drain')
      this.stop()
    }

    // Fill queue with blocks
    this.queue.push(blocks)

    await execPromise
  }

  /**
   * Stop the worker, optionally an error is thrown if received
   *
   * @param {object} error
   */
  stop (error) {
    if (!this.running) {
      return
    }

    this.running = false
    this.queue.kill()

    if (error) {
      this.execution && this.execution.reject(error)
    } else {
      this.execution && this.execution.resolve()
    }
  }

  /**
   * Process the next block in the queue.
   * @param {Block} block
   */
  async _processNext (block) {
    if (!this.running) {
      return
    }

    // Execute work
    log('queue:work')

    let execErr
    try {
      await this.executeWork(block)
    } catch (err) {
      execErr = err
    }

    log('queue:work:done', execErr)
  }
}

exports = module.exports = WorkerQueue
