'use strict'

const importer = require('ipfs-unixfs-importer')
const last = require('async-iterator-last')

const createShard = async (ipld, files, shardSplitThreshold = 10) => {
  const result = await last(importer(files, ipld, {
    shardSplitThreshold,
    reduceSingleLeafToSelf: false, // same as go-ipfs-mfs implementation, differs from `ipfs add`(!)
    leafType: 'raw' // same as go-ipfs-mfs implementation, differs from `ipfs add`(!)
  }))

  return result.cid
}

module.exports = createShard
