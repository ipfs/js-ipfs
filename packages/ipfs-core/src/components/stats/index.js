'use strict'

const createBW = require('./bw')
const createRepo = require('../repo/stat')
const createBitswap = require('../bitswap/stat')

class StatsAPI {
  /**
   * @param {Object} config
   * @param {Repo} config.repo
   * @param {NetworkService} config.network
   */
  constructor ({ repo, network }) {
    this.repo = createRepo({ repo })
    this.bw = createBW({ network })
    this.bitswap = createBitswap({ network })
  }
}

module.exports = StatsAPI

/**
 * @typedef {import('..').Repo} Repo
 * @typedef {import('..').PeerId} PeerId
 * @typedef {import('..').LibP2P} LibP2P
 * @typedef {import('..').CID} CID
 * @typedef {import('..').NetworkService} NetworkService
 * @typedef {import('..').AbortOptions} AbortOptions
 */
