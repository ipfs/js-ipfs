'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const normaliseInput = require('ipfs-utils/src/pins/normalise-input')

module.exports = configure(({ ky }) => {
  return async function * (source, options) {
    options = options || {}

    for await (const { path, recursive, comments } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams)
      searchParams.append('arg', `${path}`)

      if (recursive != null) searchParams.set('recursive', recursive)
      if (comments != null) searchParams.set('comments', comments)

      const res = await ky.post('pin/add', {
        timeout: options.timeout,
        signal: options.signal,
        headers: options.headers,
        searchParams
      }).json()

      yield * (res.Pins || []).map(cid => ({ cid: new CID(cid) }))
    }
  }
})
