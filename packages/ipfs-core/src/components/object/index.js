'use strict'

const createData = require('./data')
const createGet = require('./get')
const createLinks = require('./links')
const createNew = require('./new')
const createPut = require('./put')
const createStat = require('./stat')
const ObjectPatchAPI = require('./patch')

/**
 * @typedef {import('../../types').Preload} Preload
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

class ObjectAPI {
  /**
   * @param {Object} config
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
   * @param {Preload} config.preload
   */
  constructor ({ repo, codecs, preload }) {
    this.data = createData({ repo, preload })
    this.get = createGet({ repo, preload })
    this.links = createLinks({ repo, codecs })
    this.new = createNew({ repo, preload })
    this.put = createPut({ repo, preload })
    this.stat = createStat({ repo, preload })
    this.patch = new ObjectPatchAPI({ repo, preload })
  }
}

module.exports = ObjectAPI
