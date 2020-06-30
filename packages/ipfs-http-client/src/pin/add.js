'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const normaliseInput = require('ipfs-utils/src/pins/normalise-input')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * (source, options = {}) {
    for await (const { path, recursive, comments } of normaliseInput(source)) {
      const res = await (await api.post('pin/add', {
        timeout: options.timeout,
        signal: options.signal,
        searchParams: toUrlSearchParams({
          arg: path,
          recursive,
          comments,
          ...options
        }),
        headers: options.headers
      })).json()

      yield * (res.Pins || []).map(cid => ({ cid: new CID(cid) }))
    }
  }
})
