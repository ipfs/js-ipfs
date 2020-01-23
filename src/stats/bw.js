'use strict'

const ndjson = require('iterable-ndjson')
const Big = require('bignumber.js')
const configure = require('../lib/configure')
const toIterable = require('stream-to-it/source')

module.exports = configure(({ ky }) => {
  return async function * bw (options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.interval) searchParams.set('interval', options.interval)
    if (options.peer) searchParams.set('peer', options.peer)
    if (options.poll != null) searchParams.set('poll', options.poll)
    if (options.proto) searchParams.set('proto', options.proto)

    const res = await ky.post('stats/bw', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const stats of ndjson(toIterable(res.body))) {
      yield {
        totalIn: new Big(stats.TotalIn),
        totalOut: new Big(stats.TotalOut),
        rateIn: new Big(stats.RateIn),
        rateOut: new Big(stats.RateOut)
      }
    }
  }
})
