'use strict'

/* eslint-env browser */

const { DAG } = require('./dag')
const { Core } = require('./core')
const { Files } = require('./files')

/**
 * @typedef {import('./ipfs').IPFS} IPFS
 */

class IPFSService {
  /**
   *
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this.dag = new DAG(ipfs)
    this.core = new Core(ipfs)
    this.files = new Files(ipfs)
  }
}

exports.IPFSService = IPFSService
