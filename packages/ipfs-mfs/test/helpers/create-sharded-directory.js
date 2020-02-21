'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const createShard = require('./create-shard')

module.exports = async (mfs, shardSplitThreshold = 10, files = shardSplitThreshold) => {
  const dirPath = `/sharded-dir-${Math.random()}`
  const cid = await createShard(mfs.ipld, new Array(files).fill(0).map((_, index) => ({
    path: `${dirPath}/file-${index}`,
    content: Buffer.from([0, 1, 2, 3, 4, 5, index])
  })), shardSplitThreshold)

  await mfs.cp(`/ipfs/${cid}`, dirPath)

  expect((await mfs.stat(`/ipfs/${cid}`)).type).to.equal('hamt-sharded-directory')
  expect((await mfs.stat(dirPath)).type).to.equal('hamt-sharded-directory')

  return dirPath
}
