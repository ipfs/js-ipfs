'use strict'

const createShard = require('./create-shard')

const createTwoShards = async (ipld, fileCount) => {
  const shardSplitThreshold = 10
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

  const dirWithAllFiles = await createShard(ipld, allFiles, shardSplitThreshold)
  const dirWithSomeFiles = await createShard(ipld, someFiles, shardSplitThreshold)

  return {
    nextFile,
    dirWithAllFiles,
    dirWithSomeFiles,
    dirPath
  }
}

module.exports = createTwoShards
