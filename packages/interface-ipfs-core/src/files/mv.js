/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const createShardedDirectory = require('../utils/create-sharded-directory')
const concat = require('it-concat')
const randomBytes = require('iso-random-stream/src/random')
const isShardAtPath = require('../utils/is-shard-at-path')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.mv', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    before(async () => {
      await ipfs.files.mkdir('/test/lv1/lv2', { parents: true })
      await ipfs.files.write('/test/a', Buffer.from('Hello, world!'), { create: true })
    })
    after(() => common.clean())

    it('refuses to move files without arguments', async () => {
      await expect(ipfs.files.mv()).to.eventually.be.rejected()
    })

    it('refuses to move files without enough arguments', async () => {
      await expect(ipfs.files.mv()).to.eventually.be.rejected()
    })

    it('moves a file', async () => {
      const source = `/source-file-${Math.random()}.txt`
      const destination = `/dest-file-${Math.random()}.txt`
      const data = randomBytes(500)

      await ipfs.files.write(source, data, {
        create: true
      })
      await ipfs.files.mv(source, destination)

      const buffer = await concat(ipfs.files.read(destination))
      expect(buffer.slice()).to.deep.equal(data)

      await expect(ipfs.files.stat(source)).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('moves a directory', async () => {
      const source = `/source-directory-${Math.random()}`
      const destination = `/dest-directory-${Math.random()}`

      await ipfs.files.mkdir(source)
      await ipfs.files.mv(source, destination, {
        recursive: true
      })
      const stats = await ipfs.files.stat(destination)

      expect(stats.type).to.equal('directory')

      try {
        await ipfs.files.stat(source)
        throw new Error('Directory was copied but not removed')
      } catch (err) {
        expect(err.message).to.contain('does not exist')
      }
    })

    it('moves directories recursively', async () => {
      const directory = `source-directory-${Math.random()}`
      const subDirectory = `/source-directory-${Math.random()}`
      const source = `/${directory}${subDirectory}`
      const destination = `/dest-directory-${Math.random()}`

      await ipfs.files.mkdir(source, {
        parents: true
      })
      await ipfs.files.mv(`/${directory}`, destination, {
        recursive: true
      })

      const stats = await ipfs.files.stat(destination)
      expect(stats.type).to.equal('directory')

      const subDirectoryStats = await ipfs.files.stat(`${destination}${subDirectory}`)
      expect(subDirectoryStats.type).to.equal('directory')

      try {
        await ipfs.files.stat(source)
        throw new Error('Directory was copied but not removed')
      } catch (err) {
        expect(err.message).to.contain('does not exist')
      }
    })

    it('moves a sharded directory to a normal directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const dirPath = `/dir-${Math.random()}`
      const finalShardedDirPath = `${dirPath}${shardedDirPath}`

      await ipfs.files.mkdir(dirPath)
      await ipfs.files.mv(shardedDirPath, dirPath)

      await expect(isShardAtPath(finalShardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')

      try {
        await ipfs.files.stat(shardedDirPath)
        throw new Error('Dir was not removed')
      } catch (error) {
        expect(error.message).to.contain('does not exist')
      }
    })

    it('moves a normal directory to a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const dirPath = `/dir-${Math.random()}`
      const finalDirPath = `${shardedDirPath}${dirPath}`

      await ipfs.files.mkdir(dirPath)
      await ipfs.files.mv(dirPath, shardedDirPath)

      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalDirPath)).type).to.equal('directory')

      try {
        await ipfs.files.stat(dirPath)
        throw new Error('Dir was not removed')
      } catch (error) {
        expect(error.message).to.contain('does not exist')
      }
    })

    it('moves a sharded directory to a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const otherShardedDirPath = await createShardedDirectory(ipfs)
      const finalShardedDirPath = `${shardedDirPath}${otherShardedDirPath}`

      await ipfs.files.mv(otherShardedDirPath, shardedDirPath)

      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      await expect(isShardAtPath(finalShardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(finalShardedDirPath)).type).to.equal('directory')

      try {
        await ipfs.files.stat(otherShardedDirPath)
        throw new Error('Sharded dir was not removed')
      } catch (error) {
        expect(error.message).to.contain('does not exist')
      }
    })

    it('moves a file from a normal directory to a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const dirPath = `/dir-${Math.random()}`
      const file = `file-${Math.random()}.txt`
      const filePath = `${dirPath}/${file}`
      const finalFilePath = `${shardedDirPath}/${file}`

      await ipfs.files.mkdir(dirPath)
      await ipfs.files.write(filePath, Buffer.from([0, 1, 2, 3, 4]), {
        create: true
      })

      await ipfs.files.mv(filePath, shardedDirPath)

      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalFilePath)).type).to.equal('file')

      try {
        await ipfs.files.stat(filePath)
        throw new Error('File was not removed')
      } catch (error) {
        expect(error.message).to.contain('does not exist')
      }
    })

    it('moves a file from a sharded directory to a normal directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const dirPath = `/dir-${Math.random()}`
      const file = `file-${Math.random()}.txt`
      const filePath = `${shardedDirPath}/${file}`
      const finalFilePath = `${dirPath}/${file}`

      await ipfs.files.mkdir(dirPath)
      await ipfs.files.write(filePath, Buffer.from([0, 1, 2, 3, 4]), {
        create: true
      })

      await ipfs.files.mv(filePath, dirPath)

      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalFilePath)).type).to.equal('file')
      expect((await ipfs.files.stat(dirPath)).type).to.equal('directory')

      try {
        await ipfs.files.stat(filePath)
        throw new Error('File was not removed')
      } catch (error) {
        expect(error.message).to.contain('does not exist')
      }
    })

    it('moves a file from a sharded directory to a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const otherShardedDirPath = await createShardedDirectory(ipfs)
      const file = `file-${Math.random()}.txt`
      const filePath = `${shardedDirPath}/${file}`
      const finalFilePath = `${otherShardedDirPath}/${file}`

      await ipfs.files.write(filePath, Buffer.from([0, 1, 2, 3, 4]), {
        create: true
      })

      await ipfs.files.mv(filePath, otherShardedDirPath)

      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalFilePath)).type).to.equal('file')
      await expect(isShardAtPath(otherShardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(otherShardedDirPath)).type).to.equal('directory')

      try {
        await ipfs.files.stat(filePath)
        throw new Error('File was not removed')
      } catch (error) {
        expect(error.message).to.contain('does not exist')
      }
    })

    it('moves a file from a sub-shard of a sharded directory to a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const otherShardedDirPath = await createShardedDirectory(ipfs)
      const file = 'file-1a.txt'
      const filePath = `${shardedDirPath}/${file}`
      const finalFilePath = `${otherShardedDirPath}/${file}`

      await ipfs.files.write(filePath, Buffer.from([0, 1, 2, 3, 4]), {
        create: true
      })

      await ipfs.files.mv(filePath, otherShardedDirPath)

      await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(shardedDirPath)).type).to.equal('directory')
      expect((await ipfs.files.stat(finalFilePath)).type).to.equal('file')
      await expect(isShardAtPath(otherShardedDirPath, ipfs)).to.eventually.be.true()
      expect((await ipfs.files.stat(otherShardedDirPath)).type).to.equal('directory')

      try {
        await ipfs.files.stat(filePath)
        throw new Error('File was not removed')
      } catch (error) {
        expect(error.message).to.contain('does not exist')
      }
    })
  })
}
