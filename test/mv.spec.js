/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const createMfs = require('./helpers/create-mfs')
const createShardedDirectory = require('./helpers/create-sharded-directory')
const streamToBuffer = require('./helpers/stream-to-buffer')
const crypto = require('crypto')

describe('mv', () => {
  let mfs

  before(async () => {
    mfs = await createMfs()
  })

  it('refuses to move files without arguments', async () => {
    try {
      await mfs.mv()
      throw new Error('No error was thrown for missing files')
    } catch (err) {
      expect(err.message).to.contain('Please supply at least one source')
    }
  })

  it('refuses to move files without enough arguments', async () => {
    try {
      await mfs.mv('/destination')
      throw new Error('No error was thrown for missing files')
    } catch (err) {
      expect(err.message).to.contain('Please supply at least one source')
    }
  })

  it('moves a file', async () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/dest-file-${Math.random()}.txt`
    const data = crypto.randomBytes(500)

    await mfs.write(source, data, {
      create: true
    })
    await mfs.mv(source, destination)

    const buffer = await streamToBuffer(mfs.read(destination))
    expect(buffer).to.deep.equal(data)

    try {
      await mfs.stat(source)
      throw new Error('File was copied but not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('moves a directory', async () => {
    const source = `/source-directory-${Math.random()}`
    const destination = `/dest-directory-${Math.random()}`

    await mfs.mkdir(source)
    await mfs.mv(source, destination, {
      recursive: true
    })
    const stats = await mfs.stat(destination)

    expect(stats.type).to.equal('directory')

    try {
      await mfs.stat(source)
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

    await mfs.mkdir(source, {
      parents: true
    })
    await mfs.mv(`/${directory}`, destination, {
      recursive: true
    })

    const stats = await mfs.stat(destination)
    expect(stats.type).to.equal('directory')

    const subDirectoryStats = await mfs.stat(`${destination}${subDirectory}`)
    expect(subDirectoryStats.type).to.equal('directory')

    try {
      await mfs.stat(source)
      throw new Error('Directory was copied but not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('moves a sharded directory to a normal directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const dirPath = `/dir-${Math.random()}`
    const finalShardedDirPath = `${dirPath}${shardedDirPath}`

    await mfs.mkdir(dirPath)
    await mfs.mv(shardedDirPath, dirPath)

    expect((await mfs.stat(finalShardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(dirPath)).type).to.equal('directory')

    try {
      await mfs.stat(shardedDirPath)
      throw new Error('Dir was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('moves a normal directory to a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const dirPath = `/dir-${Math.random()}`
    const finalDirPath = `${shardedDirPath}${dirPath}`

    await mfs.mkdir(dirPath)
    await mfs.mv(dirPath, shardedDirPath)

    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalDirPath)).type).to.equal('directory')

    try {
      await mfs.stat(dirPath)
      throw new Error('Dir was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('moves a sharded directory to a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const otherShardedDirPath = await createShardedDirectory(mfs)
    const finalShardedDirPath = `${shardedDirPath}${otherShardedDirPath}`

    await mfs.mv(otherShardedDirPath, shardedDirPath)

    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalShardedDirPath)).type).to.equal('hamt-sharded-directory')

    try {
      await mfs.stat(otherShardedDirPath)
      throw new Error('Sharded dir was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('moves a file from a normal directory to a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const dirPath = `/dir-${Math.random()}`
    const file = `file-${Math.random()}.txt`
    const filePath = `${dirPath}/${file}`
    const finalFilePath = `${shardedDirPath}/${file}`

    await mfs.mkdir(dirPath)
    await mfs.write(filePath, Buffer.from([0, 1, 2, 3, 4]), {
      create: true
    })

    await mfs.mv(filePath, shardedDirPath)

    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalFilePath)).type).to.equal('file')

    try {
      await mfs.stat(filePath)
      throw new Error('File was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('moves a file from a sharded directory to a normal directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const dirPath = `/dir-${Math.random()}`
    const file = `file-${Math.random()}.txt`
    const filePath = `${shardedDirPath}/${file}`
    const finalFilePath = `${dirPath}/${file}`

    await mfs.mkdir(dirPath)
    await mfs.write(filePath, Buffer.from([0, 1, 2, 3, 4]), {
      create: true
    })

    await mfs.mv(filePath, dirPath)

    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalFilePath)).type).to.equal('file')
    expect((await mfs.stat(dirPath)).type).to.equal('directory')

    try {
      await mfs.stat(filePath)
      throw new Error('File was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('moves a file from a sharded directory to a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const otherShardedDirPath = await createShardedDirectory(mfs)
    const file = `file-${Math.random()}.txt`
    const filePath = `${shardedDirPath}/${file}`
    const finalFilePath = `${otherShardedDirPath}/${file}`

    await mfs.write(filePath, Buffer.from([0, 1, 2, 3, 4]), {
      create: true
    })

    await mfs.mv(filePath, otherShardedDirPath)

    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalFilePath)).type).to.equal('file')
    expect((await mfs.stat(otherShardedDirPath)).type).to.equal('hamt-sharded-directory')

    try {
      await mfs.stat(filePath)
      throw new Error('File was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('moves a file from a sub-shard of a sharded directory to a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs, 10, 75)
    const otherShardedDirPath = await createShardedDirectory(mfs)
    const file = 'file-1a.txt'
    const filePath = `${shardedDirPath}/${file}`
    const finalFilePath = `${otherShardedDirPath}/${file}`

    await mfs.write(filePath, Buffer.from([0, 1, 2, 3, 4]), {
      create: true
    })

    await mfs.mv(filePath, otherShardedDirPath)

    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalFilePath)).type).to.equal('file')
    expect((await mfs.stat(otherShardedDirPath)).type).to.equal('hamt-sharded-directory')

    try {
      await mfs.stat(filePath)
      throw new Error('File was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })
})
