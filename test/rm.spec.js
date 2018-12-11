/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const bufferStream = require('pull-buffer-stream')
const CID = require('cids')
const {
  createMfs,
  createShardedDirectory,
  createTwoShards
} = require('./helpers')
const {
  FILE_SEPARATOR
} = require('../src/core/utils')

describe('rm', () => {
  let mfs

  before(async () => {
    mfs = await createMfs()
  })

  it('refuses to remove files without arguments', async () => {
    try {
      await mfs.rm()
      throw new Error('No error was thrown for missing paths')
    } catch (err) {
      expect(err.message).to.contain('Please supply at least one path to remove')
    }
  })

  it('refuses to remove the root path', async () => {
    try {
      await mfs.rm(FILE_SEPARATOR)
      throw new Error('No error was thrown for missing paths')
    } catch (err) {
      expect(err.message).to.contain('Cannot delete root')
    }
  })

  it('refuses to remove a directory without the recursive flag', async () => {
    const path = `/directory-${Math.random()}`

    await mfs.mkdir(path)

    try {
      await mfs.rm(path)
      throw new Error('No error was thrown for missing recursive flag')
    } catch (err) {
      expect(err.message).to.contain(`${path} is a directory, use -r to remove directories`)
    }
  })

  it('refuses to remove a non-existent file', async () => {
    try {
      await mfs.rm(`/file-${Math.random()}`)
      throw new Error('No error was thrown for non-existent file')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('removes a file', async () => {
    const file = `/some-file-${Math.random()}.txt`

    await mfs.write(file, bufferStream(100), {
      create: true,
      parents: true
    })

    await mfs.rm(file, {
      recursive: true
    })

    try {
      await mfs.stat(file)
      throw new Error('File was not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('removes multiple files', async () => {
    const file1 = `/some-file-${Math.random()}.txt`
    const file2 = `/some-file-${Math.random()}.txt`

    await mfs.write(file1, bufferStream(100), {
      create: true,
      parents: true
    })
    await mfs.write(file2, bufferStream(100), {
      create: true,
      parents: true
    })
    await mfs.rm(file1, file2, {
      recursive: true
    })

    try {
      await mfs.stat(file1)
      throw new Error('File #1 was not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }

    try {
      await mfs.stat(file2)
      throw new Error('File #2 was not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('removes a directory', async () => {
    const directory = `/directory-${Math.random()}`

    await mfs.mkdir(directory)
    await mfs.rm(directory, {
      recursive: true
    })

    try {
      await mfs.stat(directory)
      throw new Error('Directory was not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('recursively removes a directory', async () => {
    const directory = `/directory-${Math.random()}`
    const subdirectory = `/directory-${Math.random()}`
    const path = `${directory}${subdirectory}`

    await mfs.mkdir(path, {
      parents: true
    })
    await mfs.rm(directory, {
      recursive: true
    })

    try {
      await mfs.ls(subdirectory)
      throw new Error('File was not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }

    try {
      await mfs.ls(directory)
      throw new Error('Directory was not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('recursively removes a directory with files in', async () => {
    const directory = `directory-${Math.random()}`
    const file = `/${directory}/some-file-${Math.random()}.txt`

    await mfs.write(file, bufferStream(100), {
      create: true,
      parents: true
    })
    await mfs.rm(`/${directory}`, {
      recursive: true
    })

    try {
      await mfs.stat(file)
      throw new Error('File was not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }

    try {
      await mfs.stat(`/${directory}`)
      throw new Error('Directory was not removed')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('recursively removes a sharded directory inside a normal directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const dir = `dir-${Math.random()}`
    const dirPath = `/${dir}`

    await mfs.mkdir(dirPath)

    await mfs.mv(shardedDirPath, dirPath)

    const finalShardedDirPath = `${dirPath}${shardedDirPath}`

    expect((await mfs.stat(finalShardedDirPath)).type).to.equal('hamt-sharded-directory')

    await mfs.rm(dirPath, {
      recursive: true
    })

    try {
      await mfs.stat(dirPath)
      throw new Error('Directory was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }

    try {
      await mfs.stat(shardedDirPath)
      throw new Error('Directory was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('recursively removes a sharded directory inside a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const otherDirPath = await createShardedDirectory(mfs)

    await mfs.mv(shardedDirPath, otherDirPath)

    const finalShardedDirPath = `${otherDirPath}${shardedDirPath}`

    expect((await mfs.stat(finalShardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(otherDirPath)).type).to.equal('hamt-sharded-directory')

    await mfs.rm(otherDirPath, {
      recursive: true
    })

    try {
      await mfs.stat(otherDirPath)
      throw new Error('Directory was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }

    try {
      await mfs.stat(finalShardedDirPath)
      throw new Error('Directory was not removed')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('results in the same hash as a sharded directory created by the importer when removing a file', async function () {
    this.timeout(60000)

    const {
      nextFile,
      dirWithAllFiles,
      dirWithSomeFiles,
      dirPath
    } = await createTwoShards(mfs.ipld, 15)

    await mfs.cp(`/ipfs/${dirWithAllFiles.toBaseEncodedString()}`, dirPath)

    await mfs.rm(nextFile.path)

    const stats = await mfs.stat(dirPath)
    const updatedDirCid = new CID(stats.hash)

    expect(stats.type).to.equal('hamt-sharded-directory')
    expect(updatedDirCid.toBaseEncodedString()).to.deep.equal(dirWithSomeFiles.toBaseEncodedString())
  })

  it('results in the same hash as a sharded directory created by the importer when removing a subshard', async function () {
    this.timeout(60000)

    const {
      nextFile,
      dirWithAllFiles,
      dirWithSomeFiles,
      dirPath
    } = await createTwoShards(mfs.ipld, 31)

    await mfs.cp(`/ipfs/${dirWithAllFiles.toBaseEncodedString()}`, dirPath)

    await mfs.rm(nextFile.path)

    const stats = await mfs.stat(dirPath)
    const updatedDirCid = new CID(stats.hash)

    expect(stats.type).to.equal('hamt-sharded-directory')
    expect(updatedDirCid.toBaseEncodedString()).to.deep.equal(dirWithSomeFiles.toBaseEncodedString())
  })

  it('results in the same hash as a sharded directory created by the importer when removing a file from a subshard of a subshard', async function () {
    this.timeout(60000)

    const {
      nextFile,
      dirWithAllFiles,
      dirWithSomeFiles,
      dirPath
    } = await createTwoShards(mfs.ipld, 2187)

    await mfs.cp(`/ipfs/${dirWithAllFiles.toBaseEncodedString()}`, dirPath)

    await mfs.rm(nextFile.path)

    const stats = await mfs.stat(dirPath)
    const updatedDirCid = new CID(stats.hash)

    expect(stats.type).to.equal('hamt-sharded-directory')
    expect(updatedDirCid.toBaseEncodedString()).to.deep.equal(dirWithSomeFiles.toBaseEncodedString())
  })

  it('results in the same hash as a sharded directory created by the importer when removing a subshard of a subshard', async function () {
    this.timeout(60000)

    const {
      nextFile,
      dirWithAllFiles,
      dirWithSomeFiles,
      dirPath
    } = await createTwoShards(mfs.ipld, 139)

    await mfs.cp(`/ipfs/${dirWithAllFiles.toBaseEncodedString()}`, dirPath)

    await mfs.rm(nextFile.path)

    const stats = await mfs.stat(dirPath)
    const updatedDirCid = new CID(stats.hash)

    expect(stats.type).to.equal('hamt-sharded-directory')
    expect(updatedDirCid.toBaseEncodedString()).to.deep.equal(dirWithSomeFiles.toBaseEncodedString())
  })
})
