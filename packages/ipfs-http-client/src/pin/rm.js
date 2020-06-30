'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const normaliseInput = require('ipfs-utils/src/pins/normalise-input')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * (source, options = {}) {
    options = options || {}

    for await (const { path, recursive } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams)
      searchParams.append('arg', `${path}`)

      if (recursive != null) searchParams.set('recursive', recursive)

      const res = await ky.post('pin/rm', {
        timeout: options.timeout,
        signal: options.signal,
        headers: options.headers,
        searchParams: toUrlSearchParams({
          ...options,
          arg: `${path}`,
          recursive
        })
      })

      for await (const pin of ndjson(toIterable(res.body))) {
        if (pin.Pins) { // non-streaming response
          yield * res.Pins.map(cid => ({ cid: new CID(cid) }))

          return
        }
        yield { cid: new CID(pin.cid) }
      }
    }
  }
})
