'use strict'

const CID = require('cids')
const { Multiaddr } = require('multiaddr')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const multipartRequest = require('../lib/multipart-request')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

module.exports = configure(api => {
  /**
   * @type {DHTAPI["put"]}
   */
  async function * put (key, value, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    // @ts-ignore https://github.com/ipfs/js-ipfs-utils/issues/90
    const res = await api.post('dht/put', {
      timeout: options.timeout,
      signal,
      searchParams: toUrlSearchParams({
        arg: key,
        ...options
      }),
      ...(
        await multipartRequest(value, controller, options.headers)
      )
    })

    for await (let message of res.ndjson()) {
      message = toCamel(message)
      message.id = new CID(message.id)
      if (message.responses) {
        message.responses = message.responses.map((/** @type {{ ID: string, Addrs: string[] }} */ { ID, Addrs }) => ({
          id: ID,
          addrs: (Addrs || []).map(a => new Multiaddr(a))
        }))
      }
      yield message
    }
  }

  return put
})
