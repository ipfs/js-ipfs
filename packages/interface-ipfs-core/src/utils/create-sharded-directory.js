'use strict'

const { expect } = require('./mocha')
const last = require('it-last')
const UnixFS = require('ipfs-unixfs')

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

  const cid = result.cid
  const { value: node } = await ipfs.dag.get(cid)
  const entry = UnixFS.unmarshal(node.Data)

  expect(entry.type).to.equal('hamt-sharded-directory')

  await ipfs.files.cp(`/ipfs/${cid}`, dirPath)

  return dirPath
}
