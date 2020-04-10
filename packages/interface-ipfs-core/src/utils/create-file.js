'use strict'

const UnixFS = require('ipfs-unixfs')
const { DAGLink, DAGNode } = require('ipld-dag-pb')

// This function creates blocks from lower-level primitives
// to simulate an `ipfs add` without explicitly using `ipfs add`
// for conformance testing clients that haven't implemented UnixFS yet
module.exports = async (ipfs, data, chunkSize = 262144) => {
  const chunks = []

  for (let i = 0; i < data.length; i += chunkSize) {
    const unixfs = new UnixFS({
      type: 'file',
      data: data.slice(i, i + chunkSize)
    })
    const dagNode = new DAGNode(unixfs.marshal())
    const block = await ipfs.block.put(dagNode.serialize())

    chunks.push({
      unixfs,
      size: block.data.length,
      cid: block.cid
    })
  }

  if (chunks.length === 1) {
    return {
      cid: chunks[0].cid,
      cumulativeSize: chunks[0].size
    }
  }

  const unixfs = new UnixFS({
    type: 'file',
    blockSizes: chunks.map(chunk => chunk.unixfs.fileSize())
  })
  const dagNode = new DAGNode(unixfs.marshal(), chunks.map(chunk => new DAGLink('', chunk.size, chunk.cid)))
  const block = await ipfs.block.put(dagNode.serialize())

  return {
    cid: block.cid,
    cumulativeSize: chunks.reduce((acc, curr) => acc + curr.size, 0) + block.data.length
  }
}
