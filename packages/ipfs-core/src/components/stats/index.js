'use strict'

const createBW = require('./bw')
const createRepo = require('../repo/stat')
const createBitswap = require('../bitswap/stat')

class StatsAPI {
  /**
   * @param {Object} config
   * @param {import('ipfs-repo')} config.repo
   * @param {import('../../types').NetworkService} config.network
   */
  constructor ({ repo, network }) {
    this.repo = createRepo({ repo })
    this.bw = createBW({ network })
    this.bitswap = createBitswap({ network })
  }
}

module.exports = StatsAPI
