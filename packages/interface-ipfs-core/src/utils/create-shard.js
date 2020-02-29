'use strict'

const last = require('it-last')

const createShard = async (ipfs, files, shardSplitThreshold = 10) => {
  const result = await last(ipfs.add(files, {
    enableShardingExperiment: true,
    shardSplitThreshold
    // reduceSingleLeafToSelf: false, // same as go-ipfs-mfs implementation, differs from `ipfs add`(!)
    // rawLeaves: 'raw' // same as go-ipfs-mfs implementation, differs from `ipfs add`(!)
  }))

  return result.cid
}

module.exports = createShard
