'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/stats').API<HTTPClientExtraOptions>} StatsAPI
 */

module.exports = configure(api => {
  /**
   * @type {StatsAPI["bw"]}
   */
  async function * bw (options = {}) {
    const res = await api.post('stats/bw', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
      transform: (stats) => ({
        totalIn: BigInt(stats.TotalIn),
        totalOut: BigInt(stats.TotalOut),
        rateIn: BigInt(stats.RateIn),
        rateOut: BigInt(stats.RateOut)
      })
    })

    yield * res.ndjson()
  }
  return bw
})
