import { expect } from 'aegir/utils/chai.js'
import isShardAtPath from './is-shard-at-path.js'
import last from 'it-last'

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {number} fileCount
 */
export async function createTwoShards (ipfs, fileCount) {
  const dirPath = `/sharded-dir-${Math.random()}`
  const files = new Array(fileCount).fill(0).map((_, index) => ({
    path: `${dirPath}/file-${index}`,
    content: Uint8Array.from([0, 1, 2, 3, 4, index])
  }))
  files[files.length - 1].path = `${dirPath}/file-${fileCount - 1}`

  const allFiles = files.map(file => ({
    ...file
  }))
  const someFiles = files.map(file => ({
    ...file
  }))
  const nextFile = someFiles.pop()

  if (!nextFile) {
    throw new Error('No nextFile found')
  }

  const res1 = await last(ipfs.addAll(allFiles, {
    // for js-ipfs - go-ipfs shards everything when sharding is turned on
    shardSplitThreshold: files.length - 1,
    preload: false,
    pin: false
  }))

  if (!res1) {
    throw new Error('No result received from ipfs.addAll')
  }

  const { cid: dirWithAllFiles } = res1
  const res2 = await last(ipfs.addAll(someFiles, {
    // for js-ipfs - go-ipfs shards everything when sharding is turned on
    shardSplitThreshold: files.length - 1,
    preload: false,
    pin: false
  }))

  if (!res2) {
    throw new Error('No result received from ipfs.addAll')
  }

  const { cid: dirWithSomeFiles } = res2

  await expect(isShardAtPath(`/ipfs/${dirWithAllFiles}`, ipfs)).to.eventually.be.true()
  await expect(isShardAtPath(`/ipfs/${dirWithSomeFiles}`, ipfs)).to.eventually.be.true()

  return {
    nextFile,
    dirWithAllFiles,
    dirWithSomeFiles,
    dirPath
  }
}
