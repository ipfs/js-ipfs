'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (cid, options = {}) => {
    let res
    try {
      res = await (await api.post('object/stat', {
        timeout: options.timeout,
        signal: options.signal,
        searchParams: toUrlSearchParams({
          arg: `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`,
          ...options
        })
      })).json()
    } catch (err) {
      if (err.name === 'TimeoutError') {
        err.message = `failed to get block for ${Buffer.isBuffer(cid) ? new CID(cid) : cid}: context deadline exceeded`
      }
      throw err
    }

    return res
  }
})
