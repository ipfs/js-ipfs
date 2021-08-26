'use strict'

const { CID } = require('multiformats/cid')
const configure = require('../lib/configure')
const multipartRequest = require('../lib/multipart-request')
const toUrlSearchParams = require('../lib/to-url-search-params')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dag').API<HTTPClientExtraOptions>} DAGAPI
 */

/**
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {import('../types').Options} options
 */
module.exports = (codecs, options) => {
  const fn = configure((api) => {
    /**
     * @type {DAGAPI["put"]}
     */
    const put = async (dagNode, options = {}) => {
      const settings = {
        format: 'dag-cbor',
        hashAlg: 'sha2-256',
        inputEnc: 'raw',
        ...options
      }

      const codec = await codecs.getCodec(settings.format)
      const serialized = codec.encode(dagNode)

      // allow aborting requests on body errors
      const controller = new AbortController()
      const signal = abortSignal(controller.signal, settings.signal)

      const res = await api.post('dag/put', {
        timeout: settings.timeout,
        signal,
        searchParams: toUrlSearchParams(settings),
        ...(
          await multipartRequest(serialized, controller, settings.headers)
        )
      })
      const data = await res.json()

      return CID.parse(data.Cid['/'])
    }

    return put
  })

  return fn(options)
}
