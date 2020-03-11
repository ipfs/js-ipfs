'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return function gc (options = {}) {
    return api.ndjson('repo/gc', {
      method: 'POST',
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options,
      transform: (res) => {
        return {
          err: res.Error ? new Error(res.Error) : null,
          cid: (res.Key || {})['/'] ? new CID(res.Key['/']) : null
        }
      }
    })
  }
})
