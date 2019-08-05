/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const createMfs = require('./helpers/create-mfs')
const createShardedDirectory = require('./helpers/create-sharded-directory')
const streamToBuffer = require('./helpers/stream-to-buffer')
const streamToArray = require('./helpers/stream-to-array')
const crypto = require('crypto')

describe('cp', () => {
  let mfs

  before(async () => {
    mfs = await createMfs()
  })

  it('refuses to copy files without arguments', async () => {
    try {
      await mfs.cp()
      throw new Error('No error was thrown for missing files')
    } catch (err) {
      expect(err.message).to.contain('Please supply at least one source')
    }
  })

  it('refuses to copy files without files', async () => {
    try {
      await mfs.cp('/destination')
      throw new Error('No error was thrown for missing files')
    } catch (err) {
      expect(err.message).to.contain('Please supply at least one source')
    }
  })

  it('refuses to copy files without files even with options', async () => {
    try {
      await mfs.cp('/destination', {})
      throw new Error('No error was thrown for missing files')
    } catch (err) {
      expect(err.message).to.contain('Please supply at least one source')
    }
  })

  it('refuses to copy a non-existent file', async () => {
    try {
      await mfs.cp('/i-do-not-exist', '/output')
      throw new Error('No error was thrown for a non-existent file')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('refuses to copy files to an exsting file', async () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/dest-file-${Math.random()}.txt`

    await mfs.write(source, crypto.randomBytes(100), {
      create: true
    })
    await mfs.write(destination, crypto.randomBytes(100), {
      create: true
    })

    try {
      await mfs.cp(source, destination)
      throw new Error('No error was thrown when trying to overwrite a file')
    } catch (err) {
      expect(err.message).to.contain('directory already has entry by that name')
    }
  })

  it('refuses to copy a file to itself', async () => {
    const source = `/source-file-${Math.random()}.txt`

    await mfs.write(source, crypto.randomBytes(100), {
      create: true
    })

    try {
      await mfs.cp(source, source)
      throw new Error('No error was thrown for a non-existent file')
    } catch (err) {
      expect(err.message).to.contain('directory already has entry by that name')
    }
  })

  it('copies a file to new location', async () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/dest-file-${Math.random()}.txt`
    const data = crypto.randomBytes(500)

    await mfs.write(source, data, {
      create: true
    })

    await mfs.cp(source, destination)

    const buffer = await streamToBuffer(mfs.read(destination))

    expect(buffer).to.deep.equal(data)
  })

  it('copies a file to a pre-existing directory', async () => {
    const source = `/source-file-${Math.random()}.txt`
    const directory = `/dest-directory-${Math.random()}`
    const destination = `${directory}${source}`

    await mfs.write(source, crypto.randomBytes(500), {
      create: true
    })
    await mfs.mkdir(directory)
    await mfs.cp(source, directory)

    const stats = await mfs.stat(destination)
    expect(stats.size).to.equal(500)
  })

  it('copies directories', async () => {
    const source = `/source-directory-${Math.random()}`
    const destination = `/dest-directory-${Math.random()}`

    await mfs.mkdir(source)
    await mfs.cp(source, destination)

    const stats = await mfs.stat(destination)
    expect(stats.type).to.equal('directory')
  })

  it('copies directories recursively', async () => {
    const directory = `/source-directory-${Math.random()}`
    const subDirectory = `/source-directory-${Math.random()}`
    const source = `${directory}${subDirectory}`
    const destination = `/dest-directory-${Math.random()}`

    await mfs.mkdir(source, {
      parents: true
    })
    await mfs.cp(directory, destination)

    const stats = await mfs.stat(destination)
    expect(stats.type).to.equal('directory')

    const subDirStats = await mfs.stat(`${destination}/${subDirectory}`)
    expect(subDirStats.type).to.equal('directory')
  })

  it('copies multiple files to new location', async () => {
    const sources = [{
      path: `/source-file-${Math.random()}.txt`,
      data: crypto.randomBytes(500)
    }, {
      path: `/source-file-${Math.random()}.txt`,
      data: crypto.randomBytes(500)
    }]
    const destination = `/dest-dir-${Math.random()}`

    for (const source of sources) {
      await mfs.write(source.path, source.data, {
        create: true
      })
    }

    await mfs.cp(sources[0].path, sources[1].path, destination, {
      parents: true
    })

    for (const source of sources) {
      const buffer = await streamToBuffer(mfs.read(`${destination}${source.path}`))

      expect(buffer).to.deep.equal(source.data)
    }
  })

  it('copies files from ipfs paths', async () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/dest-file-${Math.random()}.txt`

    await mfs.write(source, crypto.randomBytes(100), {
      create: true
    })

    const stats = await mfs.stat(source)
    await mfs.cp(`/ipfs/${stats.cid}`, destination)

    const destinationStats = await mfs.stat(destination)
    expect(destinationStats.size).to.equal(100)
  })

  it('copies files from deep ipfs paths', async () => {
    const dir = `dir-${Math.random()}`
    const file = `source-file-${Math.random()}.txt`
    const source = `/${dir}/${file}`
    const destination = `/dest-file-${Math.random()}.txt`

    await mfs.write(source, crypto.randomBytes(100), {
      create: true,
      parents: true
    })

    const stats = await mfs.stat(`/${dir}`)
    await mfs.cp(`/ipfs/${stats.cid}/${file}`, destination)

    const destinationStats = await mfs.stat(destination)
    expect(destinationStats.size).to.equal(100)
  })

  it('copies files to deep mfs paths and creates intermediate directories', async () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/really/deep/path/to/dest-file-${Math.random()}.txt`

    await mfs.write(source, crypto.randomBytes(100), {
      create: true
    })

    await mfs.cp(source, destination, {
      parents: true
    })

    const destinationStats = await mfs.stat(destination)
    expect(destinationStats.size).to.equal(100)
  })

  it('fails to copy files to deep mfs paths when intermediate directories do not exist', async () => {
    const source = `/source-file-${Math.random()}.txt`
    const destination = `/really/deep/path-${Math.random()}/to-${Math.random()}/dest-file-${Math.random()}.txt`

    await mfs.write(source, crypto.randomBytes(100), {
      create: true
    })

    try {
      await mfs.cp(source, destination)
      throw new Error('No error was thrown when copying to deep directory with missing intermediate directories')
    } catch (err) {
      expect(err).to.have.property('code', 'ERR_INVALID_PARAMS')
    }
  })

  it('copies a sharded directory to a normal directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)

    const normalDir = `dir-${Math.random()}`
    const normalDirPath = `/${normalDir}`

    await mfs.mkdir(normalDirPath)

    await mfs.cp(shardedDirPath, normalDirPath)

    const finalShardedDirPath = `${normalDirPath}${shardedDirPath}`

    // should still be a sharded directory
    expect((await mfs.stat(finalShardedDirPath)).type).to.equal('hamt-sharded-directory')

    const files = await streamToArray(mfs.ls(finalShardedDirPath))

    expect(files.length).to.be.ok()
  })

  it('copies a normal directory to a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)

    const normalDir = `dir-${Math.random()}`
    const normalDirPath = `/${normalDir}`

    await mfs.mkdir(normalDirPath)

    await mfs.cp(normalDirPath, shardedDirPath)

    const finalDirPath = `${shardedDirPath}${normalDirPath}`

    // should still be a sharded directory
    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalDirPath)).type).to.equal('directory')
  })

  it('copies a file from a normal directory to a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)

    const file = `file-${Math.random()}.txt`
    const filePath = `/${file}`
    const finalFilePath = `${shardedDirPath}/${file}`

    await mfs.write(filePath, Buffer.from([0, 1, 2, 3]), {
      create: true
    })

    await mfs.cp(filePath, finalFilePath)

    // should still be a sharded directory
    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalFilePath)).type).to.equal('file')
  })

  it('copies a file from a sharded directory to a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const othershardedDirPath = await createShardedDirectory(mfs)

    const file = `file-${Math.random()}.txt`
    const filePath = `${shardedDirPath}/${file}`
    const finalFilePath = `${othershardedDirPath}/${file}`

    await mfs.write(filePath, Buffer.from([0, 1, 2, 3]), {
      create: true
    })

    await mfs.cp(filePath, finalFilePath)

    // should still be a sharded directory
    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(othershardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(finalFilePath)).type).to.equal('file')
  })

  it('copies a file from a sharded directory to a normal directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const dir = `dir-${Math.random()}`
    const dirPath = `/${dir}`

    const file = `file-${Math.random()}.txt`
    const filePath = `${shardedDirPath}/${file}`
    const finalFilePath = `${dirPath}/${file}`

    await mfs.write(filePath, Buffer.from([0, 1, 2, 3]), {
      create: true
    })

    await mfs.mkdir(dirPath)

    await mfs.cp(filePath, finalFilePath)

    // should still be a sharded directory
    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(dirPath)).type).to.equal('directory')
    expect((await mfs.stat(finalFilePath)).type).to.equal('file')
  })
})
