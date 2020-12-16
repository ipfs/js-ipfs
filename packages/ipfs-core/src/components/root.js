'use strict'

const createAddAPI = require('./add')
const createAddAllAPI = require('./add-all')
const createCatAPI = require('./cat')
const createGetAPI = require('./get')
const createLsAPI = require('./ls')

/**
 * @typedef {import('ipfs-interface').RootAPI} RootAPI
 * @implements {RootAPI}
 */
class Root {
  /**
   * @param {Object} config
   * @param {import('.').Block} config.block
   * @param {import('.').Pin} config.pin
   * @param {import('.').GCLock} config.gcLock
   * @param {import('.').Preload} config.preload
   * @param {import('.').IPLD} config.ipld
   * @param {import('ipfs-interface/src/root').ShardingOptions} [config.options]
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

module.exports = Root
