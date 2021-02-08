'use strict'

const CID = require('cids')
const { DAGNode } = require('ipld-dag-pb')
const multipartRequest = require('../lib/multipart-request')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')
const unit8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

module.exports = configure(api => {
  return async (obj, options = {}) => {
    let tmpObj = {
      Links: []
    }

    if (obj instanceof Uint8Array) {
      if (!options.enc) {
        tmpObj = {
          Data: unit8ArrayToString(obj),
          Links: []
        }
      }
    } else if (DAGNode.isDAGNode(obj)) {
      tmpObj = {
        Data: unit8ArrayToString(obj.Data),
        Links: obj.Links.map(l => ({
          Name: l.Name,
          Hash: l.Hash.toString(),
          Size: l.Tsize
        }))
      }
    } else if (typeof obj === 'object') {
      tmpObj.Data = unit8ArrayToString(obj.Data)
      tmpObj.Links = obj.Links
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
})
