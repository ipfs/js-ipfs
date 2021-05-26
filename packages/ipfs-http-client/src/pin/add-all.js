'use strict'

const CID = require('cids')
const configure = require('../lib/configure')
const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin').API<HTTPClientExtraOptions>} PinAPI
 */

module.exports = configure(api => {
  /**
   * @type {PinAPI["addAll"]}
   */
  async function * addAll (source, options = {}) {
    for await (const { path, recursive, metadata } of normaliseInput(source)) {
      const res = await api.post('pin/add', {
        timeout: options.timeout,
        signal: options.signal,
        searchParams: toUrlSearchParams({
          ...options,
          arg: path,
          recursive,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          stream: true
        }),
        headers: options.headers
      })

      for await (const pin of res.ndjson()) {
        if (pin.Pins) { // non-streaming response
          for (const cid of pin.Pins) {
            yield new CID(cid)
          }
          continue
        }

        yield new CID(pin)
      }
    }
  }
  return addAll
})
