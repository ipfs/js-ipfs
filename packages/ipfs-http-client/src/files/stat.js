'use strict'

const CID = require('cids')
const toCamelWithMetadata = require('../lib/object-to-camel-with-metadata')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (path, options = {}) => {
    if (typeof path !== 'string') {
      options = path || {}
      path = '/'
    }

    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', path)

    const res = await api.post('files/stat', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })
    const data = await res.json()

    data.WithLocality = data.WithLocality || false
    return toCoreInterface(toCamelWithMetadata(data))
  }
}

function toCoreInterface (entry) {
  entry.cid = new CID(entry.hash)
  delete entry.hash
  return entry
}
