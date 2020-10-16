'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * rmAll (source, options = {}) {
    for await (const { path, recursive } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams)
      searchParams.append('arg', `${path}`)

      if (recursive != null) searchParams.set('recursive', String(recursive))

      const res = await api.post('pin/rm', {
        timeout: options.timeout,
        signal: options.signal,
        headers: options.headers,
        searchParams: toUrlSearchParams({
          ...options,
          arg: `${path}`,
          recursive
        })
      })

      for await (const pin of res.ndjson()) {
        if (pin.Pins) { // non-streaming response
          yield * pin.Pins.map(cid => new CID(cid))
          continue
        }
        yield new CID(pin)
      }
    }
  }
})
