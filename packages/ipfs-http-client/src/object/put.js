'use strict'

const CID = require('cids')
const { DAGNode } = require('ipld-dag-pb')
const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const toFormData = require('../lib/buffer-to-form-data')

module.exports = configure(({ ky }) => {
  return async (obj, options) => {
    options = options || {}

    let tmpObj = {
      Data: null,
      Links: []
    }

    if (Buffer.isBuffer(obj)) {
      if (!options.enc) {
        tmpObj = {
          Data: obj.toString(),
          Links: []
        }
      }
    } else if (DAGNode.isDAGNode(obj)) {
      tmpObj = {
        Data: obj.Data.toString(),
        Links: obj.Links.map(l => ({
          Name: l.Name,
          Hash: l.Hash.toString(),
          Size: l.Tsize
        }))
      }
    } else if (typeof obj === 'object') {
      tmpObj.Data = obj.Data.toString()
      tmpObj.Links = obj.Links
    } else {
      throw new Error('obj not recognized')
    }

    let buf
    if (Buffer.isBuffer(obj) && options.enc) {
      buf = obj
    } else {
      buf = Buffer.from(JSON.stringify(tmpObj))
    }

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.enc) searchParams.set('inputenc', options.enc)
    if (options.pin != null) searchParams.set('pin', options.pin)
    if (options.quiet != null) searchParams.set('quiet', options.quiet)

    const { Hash } = await ky.post('object/put', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams,
      body: toFormData(buf)
    }).json()

    return new CID(Hash)
  }
})
