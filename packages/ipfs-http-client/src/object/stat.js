'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (cid, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', `${Buffer.isBuffer(cid) ? new CID(cid) : cid}`)

    let res
    try {
      res = await (await api.post('object/stat', {
        timeout: options.timeout,
        signal: options.signal,
        searchParams
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
