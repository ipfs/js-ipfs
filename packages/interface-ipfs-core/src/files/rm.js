/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const createShardedDirectory = require('../utils/create-sharded-directory')
const createTwoShards = require('../utils/create-two-shards')
const crypto = require('crypto')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.rm', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not remove not found file/dir, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.rm(`${testDir}/a`)).to.eventually.be.rejected()
    })

    it('refuses to remove files without arguments', async () => {
      try {
        await ipfs.files.rm()
        throw new Error('No error was thrown for missing paths')
      } catch (err) {
        expect(err.code).to.equal('ERR_INVALID_PARAMS')
      }
    })

    it('refuses to remove the root path', async () => {
      try {
        await ipfs.files.rm('/')
        throw new Error('No error was thrown for missing paths')
      } catch (err) {
        expect(err.code).to.equal('ERR_INVALID_PARAMS')
      }
    })

    it('refuses to remove a directory without the recursive flag', async () => {
      const path = `/directory-${Math.random()}`

      await ipfs.files.mkdir(path)

      try {
        await ipfs.files.rm(path)
        throw new Error('No error was thrown for missing recursive flag')
      } catch (err) {
        expect(err.code).to.equal('ERR_WAS_DIR')
      }
    })

    it('refuses to remove a non-existent file', async () => {
      try {
        await ipfs.files.rm(`/file-${Math.random()}`)
        throw new Error('No error was thrown for non-existent file')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
    })

    it('removes a file', async () => {
      const file = `/some-file-${Math.random()}.txt`

      await ipfs.files.write(file, crypto.randomBytes(100), {
        create: true,
        parents: true
      })

      await ipfs.files.rm(file, {
        recursive: true
      })

      try {
        await ipfs.files.stat(file)
        throw new Error('File was not removed')
      } catch (err) {
        expect(err.message).to.contain('does not exist')
      }
    })

    it('removes multiple files', async () => {
      const file1 = `/some-file-${Math.random()}.txt`
      const file2 = `/some-file-${Math.random()}.txt`

      await ipfs.files.write(file1, crypto.randomBytes(100), {
        create: true,
        parents: true
      })
      await ipfs.files.write(file2, crypto.randomBytes(100), {
        create: true,
        parents: true
      })
      await ipfs.files.rm(file1, file2, {
        recursive: true
      })

      try {
        await ipfs.files.stat(file1)
        throw new Error('File #1 was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }

      try {
        await ipfs.files.stat(file2)
        throw new Error('File #2 was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
    })

    it('removes a directory', async () => {
      const directory = `/directory-${Math.random()}`

      await ipfs.files.mkdir(directory)
      await ipfs.files.rm(directory, {
        recursive: true
      })

      try {
        await ipfs.files.stat(directory)
        throw new Error('Directory was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
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

      try {
        await ipfs.files.stat(path)
        throw new Error('File was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }

      try {
        await ipfs.files.stat(directory)
        throw new Error('Directory was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
    })

    it('recursively removes a directory with files in', async () => {
      const directory = `directory-${Math.random()}`
      const file = `/${directory}/some-file-${Math.random()}.txt`

      await ipfs.files.write(file, crypto.randomBytes(100), {
        create: true,
        parents: true
      })
      await ipfs.files.rm(`/${directory}`, {
        recursive: true
      })

      try {
        await ipfs.files.stat(file)
        throw new Error('File was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }

      try {
        await ipfs.files.stat(`/${directory}`)
        throw new Error('Directory was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
    })

    it('recursively removes a sharded directory inside a normal directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const dir = `dir-${Math.random()}`
      const dirPath = `/${dir}`

      await ipfs.files.mkdir(dirPath)

      await ipfs.files.mv(shardedDirPath, dirPath)

      const finalShardedDirPath = `${dirPath}${shardedDirPath}`

      expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('hamt-sharded-directory')

      await ipfs.files.rm(dirPath, {
        recursive: true
      })

      try {
        await ipfs.files.stat(dirPath)
        throw new Error('Directory was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }

      try {
        await ipfs.files.stat(shardedDirPath)
        throw new Error('Directory was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
    })

    it('recursively removes a sharded directory inside a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const otherDirPath = await createShardedDirectory(ipfs)

      await ipfs.files.mv(shardedDirPath, otherDirPath)

      const finalShardedDirPath = `${otherDirPath}${shardedDirPath}`

      expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('hamt-sharded-directory')
      expect((await ipfs.files.stat(otherDirPath)).type).to.equal('hamt-sharded-directory')

      await ipfs.files.rm(otherDirPath, {
        recursive: true
      })

      try {
        await ipfs.files.stat(otherDirPath)
        throw new Error('Directory was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }

      try {
        await ipfs.files.stat(finalShardedDirPath)
        throw new Error('Directory was not removed')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
    })

    it('results in the same hash as a sharded directory created by the importer when removing a file', async function () {
      this.timeout(60000)

      const {
        nextFile,
        dirWithAllFiles,
        dirWithSomeFiles,
        dirPath
      } = await createTwoShards(ipfs, 15)

      await ipfs.files.cp(`/ipfs/${dirWithAllFiles}`, dirPath)

      await ipfs.files.rm(nextFile.path)

      const stats = await ipfs.files.stat(dirPath)
      const updatedDirCid = stats.cid

      expect(stats.type).to.equal('hamt-sharded-directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a subshard', async function () {
      this.timeout(60000)

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

      expect(stats.type).to.equal('hamt-sharded-directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a file from a subshard of a subshard', async function () {
      this.timeout(60000)

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

      expect(stats.type).to.equal('hamt-sharded-directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })

    it('results in the same hash as a sharded directory created by the importer when removing a subshard of a subshard', async function () {
      this.timeout(60000)

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

      expect(stats.type).to.equal('hamt-sharded-directory')
      expect(updatedDirCid.toString()).to.deep.equal(dirWithSomeFiles.toString())
    })
  })
}
