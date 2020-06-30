'use strict'

const { Buffer } = require('buffer')
const { expect } = require('./mocha')
const isShardAtPath = require('./is-shard-at-path')
const last = require('it-last')

const createTwoShards = async (ipfs, fileCount) => {
  const dirPath = `/sharded-dir-${Math.random()}`
  const files = new Array(fileCount).fill(0).map((_, index) => ({
    path: `${dirPath}/file-${index}`,
    content: Buffer.from([0, 1, 2, 3, 4, index])
  }))
  files[files.length - 1].path = `${dirPath}/file-${fileCount - 1}`

  const allFiles = files.map(file => ({
    ...file
  }))
  const someFiles = files.map(file => ({
    ...file
  }))
  const nextFile = someFiles.pop()

  const { cid: dirWithAllFiles } = await last(ipfs.add(allFiles, {
    // for js-ipfs - go-ipfs shards everything when sharding is turned on
    shardSplitThreshold: files.length - 1
  }))
  const { cid: dirWithSomeFiles } = await last(ipfs.add(someFiles, {
    // for js-ipfs - go-ipfs shards everything when sharding is turned on
    shardSplitThreshold: files.length - 1
  }))

  await expect(isShardAtPath(`/ipfs/${dirWithAllFiles}`, ipfs)).to.eventually.be.true()
  await expect(isShardAtPath(`/ipfs/${dirWithSomeFiles}`, ipfs)).to.eventually.be.true()

  return {
    nextFile,
    dirWithAllFiles,
    dirWithSomeFiles,
    dirPath
  }
}

module.exports = createTwoShards
