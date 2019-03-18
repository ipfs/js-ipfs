'use strict'

const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const collect = require('pull-stream/sinks/collect')
const importer = require('ipfs-unixfs-importer')
const CID = require('cids')

const createShard = (ipld, files, shardSplitThreshold = 10) => {
  return new Promise((resolve, reject) => {
    pull(
      values(files),
      importer(ipld, {
        shardSplitThreshold,
        reduceSingleLeafToSelf: false, // same as go-ipfs-mfs implementation, differs from `ipfs add`(!)
        leafType: 'raw' // same as go-ipfs-mfs implementation, differs from `ipfs add`(!)
      }),
      collect((err, files) => {
        if (err) {
          return reject(err)
        }

        const dir = files[files.length - 1]

        resolve(new CID(dir.multihash))
      })
    )
  })
}

module.exports = createShard
