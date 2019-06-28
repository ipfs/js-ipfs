'use strict'

const { default: PQueue } = require('p-queue')

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
    this.queue = new PQueue({ concurrency })
  }

  /**
   * Use the queue from async to keep `concurrency` amount items running
   * @param {Block[]} blocks
   */
  async execute (blocks) {
    this.running = true

    // Fill queue with the processing blocks function
    this.queue.addAll(blocks.map((block) => async () => this._processNext(block))) // eslint-disable-line require-await

    // Wait for finishing
    await this.queue.onIdle()

    this.stop()
  }

  /**
   * Stop the worker
   */
  stop () {
    if (!this.running) {
      return
    }

    this.running = false
    this.queue.clear()
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
