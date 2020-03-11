'use strict'

const { BigNumber } = require('bignumber.js')
/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return function bw (options = {}) {
    return api.ndjson('stats/bw', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options,
      transform: (stats) => ({
        totalIn: new BigNumber(stats.TotalIn),
        totalOut: new BigNumber(stats.TotalOut),
        rateIn: new BigNumber(stats.RateIn),
        rateOut: new BigNumber(stats.RateOut)
      })
    })
  }
}
