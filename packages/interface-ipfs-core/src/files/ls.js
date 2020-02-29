/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const CID = require('cids')
const createShardedDirectory = require('../utils/create-sharded-directory')
const all = require('it-all')
const crypto = require('crypto')

const MFS_FILE_TYPES = {
  file: 0,
  directory: 1,
  'hamt-sharded-directory': 1
}

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const largeFile = crypto.randomBytes(490668)

  describe('.files.ls', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('lists the root directory by default', async () => {
      const fileName = `small-file-${Math.random()}.txt`
      const content = Buffer.from('Hello world')

      await ipfs.files.write(`/${fileName}`, content, {
        create: true
      })

      const files = await all(ipfs.files.ls())

      expect(files.find(file => file.name === fileName)).to.be.ok()
    })

    it('refuses to lists files with an empty path', async () => {
      try {
        for await (const _ of ipfs.files.ls('')) { // eslint-disable-line no-unused-vars
          // falala
        }

        throw new Error('No error was thrown for an empty path')
      } catch (err) {
        expect(err.code).to.equal('ERR_NO_PATH')
      }
    })

    it('refuses to lists files with an invalid path', async () => {
      try {
        for await (const _ of ipfs.files.ls('not-valid')) { // eslint-disable-line no-unused-vars
          // falala
        }

        throw new Error('No error was thrown for an empty path')
      } catch (err) {
        expect(err.code).to.equal('ERR_INVALID_PATH')
      }
    })

    it('lists files in a directory', async () => {
      const dirName = `dir-${Math.random()}`
      const fileName = `small-file-${Math.random()}.txt`
      const content = Buffer.from('Hello world')

      await ipfs.files.write(`/${dirName}/${fileName}`, content, {
        create: true,
        parents: true
      })

      const files = await all(ipfs.files.ls(`/${dirName}`))

      expect(files.find(file => file.name === fileName)).to.be.ok()
      expect(files.length).to.equal(1)
      expect(files[0].name).to.equal(fileName)
      expect(files[0].type).to.equal(MFS_FILE_TYPES.file)
      expect(files[0].size).to.equal(content.length)
      expect(CID.isCID(files[0].cid)).to.be.ok()
    })

    it('lists a file', async () => {
      const fileName = `small-file-${Math.random()}.txt`
      const content = Buffer.from('Hello world')

      await ipfs.files.write(`/${fileName}`, content, {
        create: true
      })

      const files = await all(ipfs.files.ls(`/${fileName}`))

      expect(files.length).to.equal(1)
      expect(files[0].name).to.equal(fileName)
      expect(files[0].type).to.equal(MFS_FILE_TYPES.file)
      expect(files[0].size).to.equal(content.length)
      expect(CID.isCID(files[0].cid)).to.be.ok()
    })

    it('fails to list non-existent file', async () => {
      try {
        for await (const _ of ipfs.files.ls('/i-do-not-exist')) { // eslint-disable-line no-unused-vars
          // falala
        }

        throw new Error('No error was thrown for a non-existent file')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
    })

    it('lists a raw node', async () => {
      const filePath = '/stat/large-file.txt'

      await ipfs.files.write(filePath, largeFile, {
        create: true,
        parents: true,
        rawLeaves: true
      })

      const stats = await ipfs.files.stat(filePath)
      const { value: node } = await ipfs.dag.get(stats.cid)
      const child = node.Links[0]

      expect(child.Hash.codec).to.equal('raw')

      const files = await all(ipfs.files.ls(`/ipfs/${child.Hash}`))

      expect(files.length).to.equal(1)
      expect(files[0].type).to.equal(0) // this is what go does
      expect(files[0].cid.toString()).to.equal(child.Hash.toString())
    })

    it('lists a raw node in an mfs directory', async () => {
      const filePath = '/stat/large-file.txt'

      await ipfs.files.write(filePath, largeFile, {
        create: true,
        parents: true,
        rawLeaves: true
      })

      const stats = await ipfs.files.stat(filePath)
      const cid = stats.cid
      const { value: node } = await ipfs.dag.get(cid)
      const child = node.Links[0]

      expect(child.Hash.codec).to.equal('raw')

      const dir = `/dir-with-raw-${Math.random()}`
      const path = `${dir}/raw-${Math.random()}`

      await ipfs.files.mkdir(dir)
      await ipfs.files.cp(`/ipfs/${child.Hash}`, path)

      const files = await all(ipfs.files.ls(`/ipfs/${child.Hash}`))

      expect(files.length).to.equal(1)
      expect(files[0].type).to.equal(0) // this is what go does
      expect(files[0].cid.toString()).to.equal(child.Hash.toString())
    })

    it('lists a sharded directory contents', async () => {
      const shardSplitThreshold = 10
      const fileCount = 11
      const dirPath = await createShardedDirectory(ipfs, shardSplitThreshold, fileCount)

      const files = await all(ipfs.files.ls(dirPath))

      expect(files.length).to.equal(fileCount)

      files.forEach(file => {
        // should be a file
        expect(file.type).to.equal(0)
      })
    })

    it('lists a file inside a sharded directory directly', async () => {
      const dirPath = await createShardedDirectory(ipfs)
      const files = await all(ipfs.files.ls(dirPath))

      const filePath = `${dirPath}/${files[0].name}`

      // should be able to ls new file directly
      const file = await all(ipfs.files.ls(filePath))

      expect(file.length).to.equal(1)
      expect(file[0].name).to.equal(files[0].name)
    })

    it('lists the contents of a directory inside a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const dirPath = `${shardedDirPath}/subdir-${Math.random()}`
      const fileName = `small-file-${Math.random()}.txt`

      await ipfs.files.mkdir(`${dirPath}`)
      await ipfs.files.write(`${dirPath}/${fileName}`, Buffer.from([0, 1, 2, 3]), {
        create: true
      })

      const files = await all(ipfs.files.ls(dirPath))

      expect(files.length).to.equal(1)
      expect(files.filter(file => file.name === fileName)).to.be.ok()
    })
  })
}
