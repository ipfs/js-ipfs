'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

function toPin (type, cid, comments) {
  const pin = {
    type,
    cid: new CID(cid)
  }

  if (comments) {
    pin.comments = comments
  }

  return pin
}

module.exports = configure(api => {
  return async function * ls (path, options = {}) {
    if (path && (path.type || path.timeout)) {
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

    for await (const pin of ndjson(toIterable(res.body))) {
      if (pin.Keys) { // non-streaming response
        for (const cid of Object.keys(pin.Keys)) {
          yield toPin(pin.Keys[cid].Type, cid, pin.Keys[cid].Comments)
        }
        return
      }
      yield toPin(pin.Type, pin.Cid, pin.Comments)
    }
  }
})
