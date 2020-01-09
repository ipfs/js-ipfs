'use strict'

const UnixFS = require('ipfs-unixfs')
const {
  DAGNode
} = require('ipld-dag-pb')
const mc = require('multicodec')
const mh = require('multihashes')

const createNode = async (context, type, options) => {
  const format = mc[options.format.toUpperCase().replace(/-/g, '_')]
  const hashAlg = mh.names[options.hashAlg]
  const metadata = new UnixFS({
    type,
    mode: options.mode,
    mtime: options.mtime
  })

  const node = new DAGNode(metadata.marshal())
  const cid = await context.ipld.put(node, format, {
    cidVersion: options.cidVersion,
    hashAlg,
    onlyHash: !options.flush
  })

  return {
    cid,
    node
  }
}

module.exports = createNode
