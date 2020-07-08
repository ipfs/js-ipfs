'use strict'

const HTTP = require('ipfs-utils/src/http')
const debug = require('debug')

const log = debug('ipfs:preload')
log.error = debug('ipfs:preload:error')

module.exports = async function preload (url, options) {
  log(url)
  options = options || {}

  const res = await HTTP.post(url, { signal: options.signal })

  for await (const _ of res.body) { // eslint-disable-line no-unused-vars
    // Read to completion but do not cache
  }
}
