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

  const node = new DAGNode(new UnixFS(type).marshal())
  const cid = await context.ipld.put(node, format, {
    cidVersion: options.cidVersion,
    hashAlg
  })

  return {
    cid,
    node
  }
}

module.exports = createNode
