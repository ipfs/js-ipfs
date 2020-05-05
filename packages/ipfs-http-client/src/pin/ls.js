'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * ls (path, options = {}) {
    if (path && path.type) {
      options = path || {}
      path = []
    }

    path = Array.isArray(path) ? path : [path]

    const res = await api.post('pin/ls', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path.map(p => `${p}`),
        ...options,
        stream: true
      }),
      headers: options.headers
    })

    for await (const pin of res.ndjson()) {
      if (pin.Keys) { // non-streaming response
        // eslint-disable-next-line guard-for-in
        for (const key in pin.Keys) {
          yield { cid: new CID(key), type: pin.Keys[key].Type }
        }
      } else {
        yield { cid: new CID(pin.Cid), type: pin.Type }
      }
    }
  }
})
