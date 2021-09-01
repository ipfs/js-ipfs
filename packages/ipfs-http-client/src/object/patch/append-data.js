'use strict'

const { CID } = require('multiformats/cid')
const multipartRequest = require('../../lib/multipart-request')
const configure = require('../../lib/configure')
const toUrlSearchParams = require('../../lib/to-url-search-params')
const abortSignal = require('../../lib/abort-signal')
const { AbortController } = require('native-abort-controller')

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object/patch').API<HTTPClientExtraOptions>} ObjectPatchAPI
 */

module.exports = configure(api => {
  /**
   * @type {ObjectPatchAPI["appendData"]}
   */
  async function appendData (cid, data, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    const res = await api.post('object/patch/append-data', {
      signal,
      searchParams: toUrlSearchParams({
        arg: `${cid}`,
        ...options
      }),
      ...(
        await multipartRequest(data, controller, options.headers)
      )
    })

    const { Hash } = await res.json()

    return CID.parse(Hash)
  }
  return appendData
})
