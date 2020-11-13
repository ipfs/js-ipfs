'use strict'

const createAddAPI = require('./add')
const createAddAllAPI = require('./add-all')
const createCatAPI = require('./cat')
const createGetAPI = require('./get')
const createLsAPI = require('./ls')

class RootAPI {
  /**
   * @param {Object} config
   * @param {Block} config.block
   * @param {Pin} config.pin
   * @param {GCLock} config.gcLock
   * @param {Preload} config.preload
   * @param {IPLD} config.ipld
   * @param {ShardingOptions} [config.options]
   */
  constructor ({ preload, gcLock, pin, block, ipld, options }) {
    const addAll = createAddAllAPI({
      preload,
      gcLock,
      block,
      pin,
      options
    })

    this.addAll = addAll
    this.add = createAddAPI({ addAll })
    this.cat = createCatAPI({ ipld, preload })
    this.get = createGetAPI({ ipld, preload })
    this.ls = createLsAPI({ ipld, preload })
  }
}

module.exports = RootAPI

/**
 * @typedef {import('.').Block} Block
 * @typedef {import('.').Pin} Pin
 * @typedef {import('.').GCLock} GCLock
 * @typedef {import('.').IPLD} IPLD
 * @typedef {import('.').Preload} Preload
 * @typedef {import('./add-all').ShardingOptions} ShardingOptions
 */
