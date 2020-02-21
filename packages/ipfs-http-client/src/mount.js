'use strict'

const configure = require('./lib/configure')
const toCamel = require('./lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.ipfsPath != null) searchParams.set('ipfs-path', options.ipfsPath)
    if (options.ipnsPath != null) searchParams.set('ipns-path', options.ipnsPath)

    const res = await ky.post('dns', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return toCamel(res)
  }
})
