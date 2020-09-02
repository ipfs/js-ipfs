'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

function toPin (type, cid, metadata) {
  const pin = {
    type,
    cid: new CID(cid)
  }

  if (metadata) {
    pin.metadata = metadata
  }

  return pin
}

module.exports = configure(api => {
  return async function * ls (options = {}) {
    if (options.paths) {
      options.paths = Array.isArray(options.paths) ? options.paths : [options.paths]
    }

    const res = await api.post('pin/ls', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        arg: (options.paths || []).map(path => `${path}`),
        stream: true
      }),
      headers: options.headers
    })

    for await (const pin of res.ndjson()) {
      if (pin.Keys) { // non-streaming response
        for (const cid of Object.keys(pin.Keys)) {
          yield toPin(pin.Keys[cid].Type, cid, pin.Keys[cid].Metadata)
        }
        return
      }

      yield toPin(pin.Type, pin.Cid, pin.Metadata)
    }
  }
})
