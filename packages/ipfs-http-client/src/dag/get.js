'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const raw = require('ipld-raw')
const configure = require('../lib/configure')

const resolvers = {
  'dag-cbor': dagCBOR.resolver,
  'dag-pb': dagPB.resolver,
  raw: raw.resolver
}

module.exports = configure((api, options) => {
  const getBlock = require('../block/get')(options)
  const dagResolve = require('./resolve')(options)

  return async (cid, options = {}) => {
    const resolved = await dagResolve(cid, options)
    const block = await getBlock(resolved.cid, options)
    const dagResolver = resolvers[resolved.cid.codec]

    if (!dagResolver) {
      throw Object.assign(
        new Error(`Missing IPLD format "${resolved.cid.codec}"`),
        { missingMulticodec: resolved.cid.codec }
      )
    }

    if (resolved.cid.codec === 'raw' && !resolved.remPath) {
      resolved.remainderPath = '/'
    }

    return dagResolver.resolve(block.data, resolved.remainderPath)
  }
})
