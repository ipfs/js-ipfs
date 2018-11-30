'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const crypto = require('crypto')
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const collect = require('pull-stream/sinks/collect')
const importer = require('ipfs-unixfs-importer')
const CID = require('cids')

module.exports = async (mfs, shardSplitThreshold = 10, files = shardSplitThreshold) => {
  const dirPath = `/sharded-dir-${Math.random()}`

  return new Promise((resolve, reject) => {
    pull(
      values(
        new Array(files).fill(0).map((_, index) => ({
          path: `${dirPath}/file-${index}`,
          content: crypto.randomBytes(5)
        }))
      ),
      importer(mfs.ipld, {
        shardSplitThreshold,
        reduceSingleLeafToSelf: false, // same as go-ipfs-mfs implementation, differs from `ipfs add`(!)
        leafType: 'raw' // same as go-ipfs-mfs implementation, differs from `ipfs add`(!)
      }),
      collect(async (err, files) => {
        if (err) {
          return reject(files)
        }

        const dir = files[files.length - 1]

        await mfs.cp(`/ipfs/${new CID(dir.multihash).toBaseEncodedString()}`, dirPath)

        expect((await mfs.stat(dirPath)).type).to.equal('hamt-sharded-directory')

        resolve(dirPath)
      })
    )
  })
}
