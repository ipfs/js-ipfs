'use strict'

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

  const dirWithAllFiles = await last(ipfs.add(allFiles))
  const dirWithSomeFiles = await last(ipfs.add(someFiles))

  await expect(isShardAtPath(dirWithAllFiles, ipfs)).to.eventually.be.true()
  await expect(isShardAtPath(dirWithSomeFiles, ipfs)).to.eventually.be.true()

  return {
    nextFile,
    dirWithAllFiles,
    dirWithSomeFiles,
    dirPath
  }
}

module.exports = createTwoShards
