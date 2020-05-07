/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const { nanoid } = require('nanoid')
const all = require('it-all')
const concat = require('it-concat')
const { fixtures } = require('../utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const mh = require('multihashing-async').multihash
const Block = require('ipld-block')
const CID = require('cids')
const randomBytes = require('iso-random-stream/src/random')
const createShardedDirectory = require('../utils/create-sharded-directory')
const isShardAtPath = require('../utils/is-shard-at-path')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.cp', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('refuses to copy files without a source', async () => {
      await expect(ipfs.files.cp()).to.eventually.be.rejected.with('Please supply at least one source')
    })

    it('refuses to copy files without a source, even with options', async () => {
      await expect(ipfs.files.cp({})).to.eventually.be.rejected.with('Please supply at least one source')
    })

    it('refuses to copy files without a destination', async () => {
      await expect(ipfs.files.cp('/source')).to.eventually.be.rejected.with('Please supply at least one source')
    })

    it('refuses to copy files without a destination, even with options', async () => {
      await expect(ipfs.files.cp('/source', {})).to.eventually.be.rejected.with('Please supply at least one source')
    })

    it('refuses to copy a non-existent file', async () => {
      await expect(ipfs.files.cp('/i-do-not-exist', '/destination', {})).to.eventually.be.rejected.with('does not exist')
    })

    it('refuses to copy multiple files to a non-existent child directory', async () => {
      const src1 = `/src1-${Math.random()}`
      const src2 = `/src2-${Math.random()}`
      const parent = `/output-${Math.random()}`

      await ipfs.files.write(src1, [], {
        create: true
      })
      await ipfs.files.write(src2, [], {
        create: true
      })
      await ipfs.files.mkdir(parent)
      await expect(ipfs.files.cp(src1, src2, `${parent}/child`)).to.eventually.be.rejectedWith(Error)
        .that.has.property('message').that.matches(/destination did not exist/)
    })

    it('refuses to copy files to an unreadable node', async () => {
      const src1 = `/src2-${Math.random()}`
      const parent = `/output-${Math.random()}`

      const cid = new CID(1, 'identity', mh.encode(Buffer.from('derp'), 'identity'))
      await ipfs.block.put(new Block(Buffer.from('derp'), cid), { cid })
      await ipfs.files.cp(`/ipfs/${cid}`, parent)

      await ipfs.files.write(src1, [], {
        create: true
      })
      await expect(ipfs.files.cp(src1, `${parent}/child`)).to.eventually.be.rejectedWith(Error)
        .that.has.property('message').that.matches(/"identity"/)
    })

    it('refuses to copy files to an exsting file', async () => {
      const source = `/source-file-${Math.random()}.txt`
      const destination = `/dest-file-${Math.random()}.txt`

      await ipfs.files.write(source, randomBytes(100), {
        create: true
      })
      await ipfs.files.write(destination, randomBytes(100), {
        create: true
      })

      try {
        await ipfs.files.cp(source, destination)
        throw new Error('No error was thrown when trying to overwrite a file')
      } catch (err) {
        expect(err.message).to.contain('directory already has entry by that name')
      }
    })

    it('refuses to copy a file to itself', async () => {
      const source = `/source-file-${Math.random()}.txt`

      await ipfs.files.write(source, randomBytes(100), {
        create: true
      })

      try {
        await ipfs.files.cp(source, source)
        throw new Error('No error was thrown for a non-existent file')
      } catch (err) {
        expect(err.message).to.contain('directory already has entry by that name')
      }
    })

    it('copies a file to new location', async () => {
      const source = `/source-file-${Math.random()}.txt`
      const destination = `/dest-file-${Math.random()}.txt`
      const data = randomBytes(500)

      await ipfs.files.write(source, data, {
        create: true
      })

      await ipfs.files.cp(source, destination)

      const buffer = await concat(ipfs.files.read(destination))

      expect(buffer.slice()).to.deep.equal(data)
    })

    it('copies a file to a pre-existing directory', async () => {
      const source = `/source-file-${Math.random()}.txt`
      const directory = `/dest-directory-${Math.random()}`
      const destination = `${directory}${source}`

      await ipfs.files.write(source, randomBytes(500), {
        create: true
      })
      await ipfs.files.mkdir(directory)
      await ipfs.files.cp(source, directory)

      const stats = await ipfs.files.stat(destination)
      expect(stats.size).to.equal(500)
    })

    it('copies directories', async () => {
      const source = `/source-directory-${Math.random()}`
      const destination = `/dest-directory-${Math.random()}`

      await ipfs.files.mkdir(source)
      await ipfs.files.cp(source, destination)

      const stats = await ipfs.files.stat(destination)
      expect(stats.type).to.equal('directory')
    })

    it('copies directories recursively', async () => {
      const directory = `/source-directory-${Math.random()}`
      const subDirectory = `/source-directory-${Math.random()}`
      const source = `${directory}${subDirectory}`
      const destination = `/dest-directory-${Math.random()}`

      await ipfs.files.mkdir(source, {
        parents: true
      })
      await ipfs.files.cp(directory, destination)

      const stats = await ipfs.files.stat(destination)
      expect(stats.type).to.equal('directory')

      const subDirStats = await ipfs.files.stat(`${destination}/${subDirectory}`)
      expect(subDirStats.type).to.equal('directory')
    })

    it('copies multiple files to new location', async () => {
      const sources = [{
        path: `/source-file-${Math.random()}.txt`,
        data: randomBytes(500)
      }, {
        path: `/source-file-${Math.random()}.txt`,
        data: randomBytes(500)
      }]
      const destination = `/dest-dir-${Math.random()}`

      for (const source of sources) {
        await ipfs.files.write(source.path, source.data, {
          create: true
        })
      }

      await ipfs.files.cp(sources[0].path, sources[1].path, destination, {
        parents: true
      })

      for (const source of sources) {
        const buffer = await concat(ipfs.files.read(`${destination}${source.path}`))

        expect(buffer.slice()).to.deep.equal(source.data)
      }
    })

    it('copies files from ipfs paths', async () => {
      const source = `/source-file-${Math.random()}.txt`
      const destination = `/dest-file-${Math.random()}.txt`

      await ipfs.files.write(source, randomBytes(100), {
        create: true
      })

      const stats = await ipfs.files.stat(source)
      await ipfs.files.cp(`/ipfs/${stats.cid}`, destination)

      const destinationStats = await ipfs.files.stat(destination)
      expect(destinationStats.size).to.equal(100)
    })

    it('copies files from deep ipfs paths', async () => {
      const dir = `dir-${Math.random()}`
      const file = `source-file-${Math.random()}.txt`
      const source = `/${dir}/${file}`
      const destination = `/dest-file-${Math.random()}.txt`

      await ipfs.files.write(source, randomBytes(100), {
        create: true,
        parents: true
      })

      const stats = await ipfs.files.stat(`/${dir}`)
      await ipfs.files.cp(`/ipfs/${stats.cid}/${file}`, destination)

      const destinationStats = await ipfs.files.stat(destination)
      expect(destinationStats.size).to.equal(100)
    })

    it('copies files to deep mfs paths and creates intermediate directories', async () => {
      const source = `/source-file-${Math.random()}.txt`
      const destination = `/really/deep/path/to/dest-file-${Math.random()}.txt`

      await ipfs.files.write(source, randomBytes(100), {
        create: true
      })

      await ipfs.files.cp(source, destination, {
        parents: true
      })

      const destinationStats = await ipfs.files.stat(destination)
      expect(destinationStats.size).to.equal(100)
    })

    it('fails to copy files to deep mfs paths when intermediate directories do not exist', async () => {
      const source = `/source-file-${Math.random()}.txt`
      const destination = `/really/deep/path-${Math.random()}/to-${Math.random()}/dest-file-${Math.random()}.txt`

      await ipfs.files.write(source, randomBytes(100), {
        create: true
      })

      await expect(ipfs.files.cp(source, destination)).to.eventually.be.rejected()
    })

    it('copies a sharded directory to a normal directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)

      const normalDir = `dir-${Math.random()}`
      const normalDirPath = `/${normalDir}`

      await ipfs.files.mkdir(normalDirPath)

      await ipfs.files.cp(shardedDirPath, normalDirPath)

      const finalShardedDirPath = `${normalDirPath}${shardedDirPath}`

      // should still be a sharded directory
      await expect(isShardAtPath(finalShardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('directory')

      const files = await all(ipfs.files.ls(finalShardedDirPath))

      expect(files.length).to.be.ok()
    })

    it('copies a normal directory to a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)

      const normalDir = `dir-${Math.random()}`
      const normalDirPath = `/${normalDir}`

      await ipfs.files.mkdir(normalDirPath)

      await ipfs.files.cp(normalDirPath, shardedDirPath)

      const finalDirPath = `${shardedDirPath}${normalDirPath}`

      // should still be a sharded directory
      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalDirPath)).type).to.equal('directory')
    })

    it('copies a file from a normal directory to a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)

      const file = `file-${Math.random()}.txt`
      const filePath = `/${file}`
      const finalFilePath = `${shardedDirPath}/${file}`

      await ipfs.files.write(filePath, Buffer.from([0, 1, 2, 3]), {
        create: true
      })

      await ipfs.files.cp(filePath, finalFilePath)

      // should still be a sharded directory
      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalFilePath)).type).to.equal('file')
    })

    it('copies a file from a sharded directory to a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const othershardedDirPath = await createShardedDirectory(ipfs)

      const file = `file-${Math.random()}.txt`
      const filePath = `${shardedDirPath}/${file}`
      const finalFilePath = `${othershardedDirPath}/${file}`

      await ipfs.files.write(filePath, Buffer.from([0, 1, 2, 3]), {
        create: true
      })

      await ipfs.files.cp(filePath, finalFilePath)

      // should still be a sharded directory
      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      await expect(isShardAtPath(othershardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(othershardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalFilePath)).type).to.equal('file')
    })

    it('copies a file from a sharded directory to a normal directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const dir = `dir-${Math.random()}`
      const dirPath = `/${dir}`

      const file = `file-${Math.random()}.txt`
      const filePath = `${shardedDirPath}/${file}`
      const finalFilePath = `${dirPath}/${file}`

      await ipfs.files.write(filePath, Buffer.from([0, 1, 2, 3]), {
        create: true
      })

      await ipfs.files.mkdir(dirPath)

      await ipfs.files.cp(filePath, finalFilePath)

      // should still be a sharded directory
      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalFilePath)).type).to.equal('file')
    })

    it('should respect metadata when copying files', async function () {
      const testSrcPath = `/test-${nanoid()}`
      const testDestPath = `/test-${nanoid()}`
      const mode = parseInt('0321', 8)
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)
      const expectedMtime = {
        secs: seconds,
        nsecs: (mtime - (seconds * 1000)) * 1000
      }

      await ipfs.files.write(testSrcPath, Buffer.from('TEST'), {
        create: true,
        mode,
        mtime
      })
      await ipfs.files.cp(testSrcPath, testDestPath)

      const stats = await ipfs.files.stat(testDestPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
      expect(stats).to.have.property('mode', mode)
    })

    it('should respect metadata when copying directories', async function () {
      const testSrcPath = `/test-${nanoid()}`
      const testDestPath = `/test-${nanoid()}`
      const mode = parseInt('0321', 8)
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)
      const expectedMtime = {
        secs: seconds,
        nsecs: (mtime - (seconds * 1000)) * 1000
      }

      await ipfs.files.mkdir(testSrcPath, {
        mode,
        mtime
      })
      await ipfs.files.cp(testSrcPath, testDestPath, {
        recursive: true
      })

      const stats = await ipfs.files.stat(testDestPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
      expect(stats).to.have.property('mode', mode)
    })

    it('should respect metadata when copying from outside of mfs', async function () {
      const testDestPath = `/test-${nanoid()}`
      const mode = parseInt('0321', 8)
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)
      const expectedMtime = {
        secs: seconds,
        nsecs: (mtime - (seconds * 1000)) * 1000
      }

      const [{
        cid
      }] = await all(ipfs.add({
        content: fixtures.smallFile.data,
        mode,
        mtime
      }))
      await ipfs.files.cp(`/ipfs/${cid}`, testDestPath)

      const stats = await ipfs.files.stat(testDestPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
      expect(stats).to.have.property('mode', mode)
    })
  })
}
