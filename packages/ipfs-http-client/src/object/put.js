'use strict'

const CID = require('cids')
const { DAGNode } = require('ipld-dag-pb')
const multipartRequest = require('../lib/multipart-request')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>} ObjectAPI
 */

module.exports = configure(api => {
  /**
   * @type {ObjectAPI["put"]}
   */
  async function put (obj, options = {}) {
    let tmpObj = {
      /** @type {string | undefined} */
      Data: undefined,
      /** @type {{ Name: string, Hash: string, Size: number }[]} */
      Links: []
    }

    if (obj instanceof Uint8Array) {
      if (!options.enc) {
        tmpObj = {
          // FIXME: this will corrupt data for byte values over 127
          Data: uint8ArrayToString(obj),
          Links: []
        }
      }
    } else if (obj instanceof DAGNode) {
      tmpObj = {
        // FIXME: this will corrupt data for byte values over 127
        Data: uint8ArrayToString(obj.Data),
        Links: obj.Links.map(l => ({
          Name: l.Name,
          Hash: l.Hash.toString(),
          Size: l.Tsize
        }))
      }
    } else if (typeof obj === 'object') {
      // FIXME: this will corrupt data for for byte values over 127
      if (obj.Data) {
        tmpObj.Data = uint8ArrayToString(obj.Data)
      }

      if (obj.Links) {
        // @ts-ignore Size is Tsize
        tmpObj.Links = obj.Links
      }
    } else {
      throw new Error('obj not recognized')
    }

    let buf
    if (obj instanceof Uint8Array && options.enc) {
      buf = obj
    } else {
      options.enc = 'json'
      buf = uint8ArrayFromString(JSON.stringify(tmpObj))
    }

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    // @ts-ignore https://github.com/ipfs/js-ipfs-utils/issues/90
    const res = await api.post('object/put', {
      timeout: options.timeout,
      signal,
      searchParams: toUrlSearchParams(options),
      ...(
        await multipartRequest(buf, controller, options.headers)
      )
    })

    const { Hash } = await res.json()

    return new CID(Hash)
  }
  return put
})
