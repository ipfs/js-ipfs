'use strict'

const createAddLink = require('./add-link')
const createAppendData = require('./append-data')
const createRmLink = require('./rm-link')
const createSetData = require('./set-data')

/**
 * @typedef {import('../../../types').Preload} Preload
 */

class ObjectPatchAPI {
  /**
   * @param {Object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {Preload} config.preload
   */
  constructor ({ repo, preload }) {
    this.addLink = createAddLink({ repo, preload })
    this.appendData = createAppendData({ repo, preload })
    this.rmLink = createRmLink({ repo, preload })
    this.setData = createSetData({ repo, preload })
  }
}

module.exports = ObjectPatchAPI
