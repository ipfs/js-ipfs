'use strict'

const CID = require('cids')
const multipartRequest = require('../../lib/multipart-request')
const configure = require('../../lib/configure')
const toUrlSearchParams = require('../../lib/to-url-search-params')
const abortSignal = require('../../lib/abort-signal')
const { AbortController } = require('native-abort-controller')

module.exports = configure(api => {
  return async (cid, data, options = {}) => {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    // @ts-ignore https://github.com/ipfs/js-ipfs-utils/issues/90
    const { Hash } = await (await api.post('object/patch/set-data', {
      timeout: options.timeout,
      signal,
      searchParams: toUrlSearchParams({
        arg: [
          `${cid instanceof Uint8Array ? new CID(cid) : cid}`
        ],
        ...options
      }),
      ...(
        await multipartRequest(data, controller, options.headers)
      )
    })).json()

    return new CID(Hash)
  }
})
