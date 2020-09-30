'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const raw = require('ipld-raw')
const configure = require('../lib/configure')
const multicodec = require('multicodec')

module.exports = configure((api, options) => {
  const getBlock = require('../block/get')(options)
  const dagResolve = require('./resolve')(options)

  const formats = {
    [multicodec.DAG_PB]: dagPB,
    [multicodec.DAG_CBOR]: dagCBOR,
    [multicodec.RAW]: raw
  }

  const ipldOptions = (options && options.ipld) || {}
  const configuredFormats = (ipldOptions && ipldOptions.formats) || []
  configuredFormats.forEach(format => {
    formats[format.codec] = format
  })

  return async (cid, options = {}) => {
    const resolved = await dagResolve(cid, options)
    const block = await getBlock(resolved.cid, options)

    const codec = multicodec[resolved.cid.codec.toUpperCase().replace(/-/g, '_')]
    const format = formats[codec]

    if (!format) {
      throw Object.assign(
        new Error(`Missing IPLD format "${resolved.cid.codec}"`),
        { missingMulticodec: resolved.cid.codec }
      )
    }

    if (resolved.cid.codec === 'raw' && !resolved.remPath) {
      resolved.remainderPath = '/'
    }

    return format.resolver.resolve(block.data, resolved.remainderPath)
  }
})
