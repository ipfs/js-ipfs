/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const createShardedDirectory = require('../utils/create-sharded-directory')
const createTwoShards = require('../utils/create-two-shards')
const randomBytes = require('iso-random-stream/src/random')
const isShardAtPath = require('../utils/is-shard-at-path')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.rm', function () {
    this.timeout(120 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not remove not found file/dir, expect error', () => {
      const testDir = `/test-${nanoid()}`

      return expect(ipfs.files.rm(`${testDir}/a`)).to.eventually.be.rejected()
    })

    it('refuses to remove files without arguments', async () => {
      await expect(ipfs.files.rm()).to.eventually.be.rejected()
    })

    it('refuses to remove the root path', async () => {
      await expect(ipfs.files.rm('/')).to.eventually.be.rejected()
    })

    it('refuses to remove a directory without the recursive flag', async () => {
      const path = `/directory-${Math.random()}.txt`

      await ipfs.files.mkdir(path)

      await expect(ipfs.files.rm(path)).to.eventually.be.rejectedWith(/use -r to remove directories/)
    })

    it('refuses to remove a non-existent file', async () => {
      await expect(ipfs.files.rm(`/file-${Math.random()}`)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('removes a file', async () => {
      const file = `/some-file-${Math.random()}.txt`

      await ipfs.files.write(file, randomBytes(100), {
        create: true,
        parents: true
      })

      await ipfs.files.rm(file)

      await expect(ipfs.files.stat(file)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('removes multiple files', async () => {
      const file1 = `/some-file-${Math.random()}.txt`
      const file2 = `/some-file-${Math.random()}.txt`

      await ipfs.files.write(file1, randomBytes(100), {
        create: true,
        parents: true
      })
      await ipfs.files.write(file2, randomBytes(100), {
        create: true,
        parents: true
      })
      await ipfs.files.rm(file1, file2)

      await expect(ipfs.files.stat(file1)).to.eventually.be.rejectedWith(/does not exist/)
      await expect(ipfs.files.stat(file2)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('removes a directory', async () => {
      const directory = `/directory-${Math.random()}`

      await ipfs.files.mkdir(directory)
      await ipfs.files.rm(directory, {
        recursive: true
      })

      await expect(ipfs.files.stat(directory)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('recursively removes a directory', async () => {
      const directory = `/directory-${Math.random()}`
      const subdirectory = `/directory-${Math.random()}`
      const path = `${directory}${subdirectory}`

      await ipfs.files.mkdir(path, {
        parents: true
      })
      await ipfs.files.rm(directory, {
        recursive: true
      })

      await expect(ipfs.files.stat(path)).to.eventually.be.rejectedWith(/does not exist/)
      await expect(ipfs.files.stat(directory)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('recursively removes a directory with files in', async () => {
      const directory = `/directory-${Math.random()}`
      const file = `${directory}/some-file-${Math.random()}.txt`

      await ipfs.files.write(file, randomBytes(100), {
        create: true,
        parents: true
      })
      await ipfs.files.rm(directory, {
        recursive: true
      })

      await expect(ipfs.files.stat(file)).to.eventually.be.rejectedWith(/does not exist/)
      await expect(ipfs.files.stat(directory)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('recursively removes a sharded directory inside a normal directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const dir = `dir-${Math.random()}`
      const dirPath = `/${dir}`

      await ipfs.files.mkdir(dirPath)

      await ipfs.files.mv(shardedDirPath, dirPath)

      const finalShardedDirPath = `${dirPath}${shardedDirPath}`

      await expect(isShardAtPath(finalShardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('directory')

      await ipfs.files.rm(dirPath, {
        recursive: true
      })

      await expect(ipfs.files.stat(dirPath)).to.eventually.be.rejectedWith(/does not exist/)
      await expect(ipfs.files.stat(shardedDirPath)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('recursively removes a sharded directory inside a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const otherDirPath = await createShardedDirectory(ipfs)

      await ipfs.files.mv(shardedDirPath, otherDirPath)

      const finalShardedDirPath = `${otherDirPath}${shardedDirPath}`

      await expect(isShardAtPath(finalShardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('directory')
      await expect(isShardAtPath(otherDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(otherDirPath)).type).to.equal('directory')

      await ipfs.files.rm(otherDirPath, {
        recursive: true
      })

      await expect(ipfs.files.stat(otherDirPath)).to.eventually.be.rejectedWith(/does not exist/)
      await expect(ipfs.files.stat(finalShardedDirPath)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('results in the same hash as a sharded directory created by the importer when removing a file', async function () {
      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 1001)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a subshard', async function () {
      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 31)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a file from a subshard of a subshard', async function () {
      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 2187)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a subshard of a subshard', async function () {
      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 139)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('should respect timeout option when removing files', async () => {
      const file = `/some-file-${Math.random()}.txt`

      await ipfs.files.write(file, randomBytes(100), {
        create: true,
        parents: true
      })

      await testTimeout(() => ipfs.files.rm(file, {
        timeout: 1
      }))
    })
  })
}
