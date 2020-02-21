'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (cid, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)

    let res
    try {
      res = await ky.post('object/stat', {
        timeout: options.timeout,
        signal: options.signal,
        headers: options.headers,
        searchParams
      }).json()
    } catch (err) {
      if (err.name === 'TimeoutError') {
        err.message = `failed to get block for ${Buffer.isBuffer(cid) ? new CID(cid) : cid}: context deadline exceeded`
      }
      throw err
    }

    return res
  }
})
