'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const normaliseInput = require('ipfs-utils/src/pins/normalise-input')

module.exports = configure(({ ky }) => {
  return async function * (source, options) {
    options = options || {}

    for await (const { path, recursive } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams)
      searchParams.append('arg', `${path}`)

      if (recursive != null) searchParams.set('recursive', recursive)

      const res = await ky.post('pin/rm', {
        timeout: options.timeout,
        signal: options.signal,
        headers: options.headers,
        searchParams
      }).json()

      yield * (res.Pins || []).map(cid => ({ cid: new CID(cid) }))
    }
  }
})
