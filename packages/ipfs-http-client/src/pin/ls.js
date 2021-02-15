'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin').API<HTTPClientExtraOptions>} PinAPI
 */

/**
 * @param {string} type
 * @param {string} cid
 * @param {Record<string, string>} metadata
 */
function toPin (type, cid, metadata) {
  /** @type {import('ipfs-core-types/src/pin').LsResult} */
  const pin = {
    type,
    cid: new CID(cid)
  }

  if (metadata) {
    pin.metadata = metadata
  }

  return pin
}

module.exports = configure(api => {
  /**
   * @type {PinAPI["ls"]}
   */
  async function * ls (options = {}) {
    /** @type {any[]} */
    let paths = []

    if (options.paths) {
      paths = Array.isArray(options.paths) ? options.paths : [options.paths]
    }

    const res = await api.post('pin/ls', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        arg: paths.map(path => `${path}`),
        stream: true
      }),
      headers: options.headers
    })

    for await (const pin of res.ndjson()) {
      if (pin.Keys) { // non-streaming response
        for (const cid of Object.keys(pin.Keys)) {
          yield toPin(pin.Keys[cid].Type, cid, pin.Keys[cid].Metadata)
        }
        return
      }

      yield toPin(pin.Type, pin.Cid, pin.Metadata)
    }
  }
  return ls
})
