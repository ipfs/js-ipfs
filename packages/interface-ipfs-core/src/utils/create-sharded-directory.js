'use strict'

const { expect } = require('./mocha')
const createShard = require('./create-shard')

module.exports = async (ipfs, shardSplitThreshold = 10, files = shardSplitThreshold) => {
  const dirPath = `/sharded-dir-${Math.random()}`
  const cid = await createShard(ipfs, new Array(files).fill(0).map((_, index) => ({
    path: `${dirPath}/file-${index}`,
    content: Buffer.from([0, 1, 2, 3, 4, 5, index])
  })), shardSplitThreshold)

  await ipfs.files.cp(`/ipfs/${cid}`, dirPath)

  expect((await ipfs.files.stat(`/ipfs/${cid}`)).type).to.equal('hamt-sharded-directory')
  expect((await ipfs.files.stat(dirPath)).type).to.equal('hamt-sharded-directory')

  return dirPath
}
