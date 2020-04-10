'use strict'

const { Buffer } = require('buffer')
const CID = require('cids')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')

module.exports = configure((api, options) => {
  const refs = async function * (args, options = {}) {
    const searchParams = new URLSearchParams(options)

    if (!Array.isArray(args)) {
      args = [args]
    }

    for (const arg of args) {
      searchParams.append('arg', `${Buffer.isBuffer(arg) ? new CID(arg) : arg}`)
    }

    const res = await api.post('refs', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      transform: toCamel
    })

    yield * res.ndjson()
  }
  refs.local = require('./local')(options)

  return refs
})
