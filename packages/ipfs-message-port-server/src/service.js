'use strict'

/* eslint-env browser */

const { DAGService } = require('./dag')
const { CoreService } = require('./core')
const { FilesService } = require('./files')
const { BlockService } = require('./block')

/**
 * @typedef {import('./ipfs').IPFS} IPFS
 */

class IPFSService {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.dag = new DAGService(ipfs)
    this.core = new CoreService(ipfs)
    this.files = new FilesService(ipfs)
    this.block = new BlockService(ipfs)
  }
}

exports.IPFSService = IPFSService
