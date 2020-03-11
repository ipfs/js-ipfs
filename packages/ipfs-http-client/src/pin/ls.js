'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async function * ls (path, options = {}) {
    if (path && path.type) {
      options = path || {}
      path = []
    }

    path = Array.isArray(path) ? path : [path]

    const searchParams = new URLSearchParams(options)
    searchParams.set('stream', options.stream || true)
    path.forEach(p => searchParams.append('arg', `${p}`))

    const source = api.ndjson('pin/ls', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    for await (const pin of source) {
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
