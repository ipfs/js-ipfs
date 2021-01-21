'use strict'

/* eslint-env browser */

const { BlockService } = require('./block')
const { CoreService } = require('./core')
const { DAGService } = require('./dag')
const { FilesService } = require('./files')
const { PinService } = require('./pin')

/**
 * @typedef {import('./ipfs').IPFS} IPFS
 */

exports.IPFSService = class IPFSService {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.block = new BlockService(ipfs)
    this.core = new CoreService(ipfs)
    this.dag = new DAGService(ipfs)
    this.files = new FilesService(ipfs)
    this.pin = new PinService(ipfs)
  }
}
