'use strict'

const { Buffer } = require('buffer')
const { expect } = require('./mocha')
const isShardAtPath = require('./is-shard-at-path')
const last = require('it-last')

module.exports = async (ipfs, files = 1001) => {
  const dirPath = `/sharded-dir-${Math.random()}`

  const result = await last(ipfs.add(function * () {
    for (let i = 0; i < files; i++) {
      yield {
        path: `${dirPath}/file-${i}`,
        content: Buffer.from([0, 1, 2, 3, 4, 5, i])
      }
    }
  }()))

  await ipfs.files.cp(`/ipfs/${result.cid}`, dirPath)

  await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()

  return dirPath
}
