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

describe('rm', function () {
  let mfs

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
  })

  it('refuses to remove files without arguments', () => {
    return mfs.rm()
      .then(() => {
        throw new Error('No error was thrown for missing paths')
      })
      .catch(error => {
        expect(error.message).to.contain('Please supply at least one path to remove')
      })
  })

  it('refuses to remove the root path', () => {
    return mfs.rm(FILE_SEPARATOR)
      .then(() => {
        throw new Error('No error was thrown for missing paths')
      })
      .catch(error => {
        expect(error.message).to.contain('Cannot delete root')
      })
  })

  it('refuses to remove a directory without the recursive flag', () => {
    const path = `/directory-${Math.random()}`

    return mfs.mkdir(path)
      .then(() => mfs.rm(path))
      .then(() => {
        throw new Error('No error was thrown for missing recursive flag')
      })
      .catch(error => {
        expect(error.message).to.contain(`${path} is a directory, use -r to remove directories`)
      })
  })

  it('refuses to remove a non-existent file', async () => {
    try {
      await mfs.rm(`/file-${Math.random()}`)
      throw new Error('No error was thrown for non-existent file')
    } catch (error) {
      expect(error.message).to.contain('does not exist')
    }
  })

  it('removes a file', () => {
    const file = `/some-file-${Math.random()}.txt`

    return mfs.write(file, bufferStream(100), {
      create: true,
      parents: true
    })
      .then(() => mfs.rm(file, {
        recursive: true
      }))
      .then(() => mfs.stat(file))
      .then(() => {
        throw new Error('File was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain('does not exist')
      })
  })

  it('removes multiple files', () => {
    const file1 = `/some-file-${Math.random()}.txt`
    const file2 = `/some-file-${Math.random()}.txt`

    return mfs.write(file1, bufferStream(100), {
      create: true,
      parents: true
    })
      .then(() => mfs.write(file2, bufferStream(100), {
        create: true,
        parents: true
      }))
      .then(() => mfs.rm(file1, file2, {
        recursive: true
      }))
      .then(() => mfs.stat(file1))
      .then(() => {
        throw new Error('File #1 was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain('does not exist')
      })
      .then(() => mfs.stat(file2))
      .then(() => {
        throw new Error('File #2 was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain('does not exist')
      })
  })

  it('removes a directory', () => {
    const directory = `/directory-${Math.random()}`

    return mfs.mkdir(directory)
      .then(() => mfs.rm(directory, {
        recursive: true
      }))
      .then(() => mfs.stat(directory))
      .then(() => {
        throw new Error('Directory was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain('does not exist')
      })
  })

  it('recursively removes a directory', () => {
    const directory = `/directory-${Math.random()}`
    const subdirectory = `/directory-${Math.random()}`
    const path = `${directory}${subdirectory}`

    return mfs.mkdir(path, {
      parents: true
    })
      .then(() => mfs.rm(directory, {
        recursive: true
      }))
      .then(() => mfs.ls(subdirectory))
      .then(() => {
        throw new Error('File was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain('does not exist')
      })
      .then(() => mfs.ls(directory))
      .then(() => {
        throw new Error('Directory was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain('does not exist')
      })
  })

  it('recursively removes a directory with files in', () => {
    const directory = `directory-${Math.random()}`
    const file = `/${directory}/some-file-${Math.random()}.txt`

    return mfs.write(file, bufferStream(100), {
      create: true,
      parents: true
    })
      .then(() => mfs.rm(`/${directory}`, {
        recursive: true
      }))
      .then(() => mfs.stat(file))
      .then(() => {
        throw new Error('File was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain('does not exist')
      })
      .then(() => mfs.stat(`/${directory}`))
      .then(() => {
        throw new Error('Directory was not removed')
      })
      .catch(error => {
        expect(error.message).to.contain('does not exist')
      })
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
    } = await createTwoShards(mfs, 15)

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
    } = await createTwoShards(mfs, 31)

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
    } = await createTwoShards(mfs, 2187)

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
    } = await createTwoShards(mfs, 139)

    await mfs.cp(`/ipfs/${dirWithAllFiles.toBaseEncodedString()}`, dirPath)

    await mfs.rm(nextFile.path)

    const stats = await mfs.stat(dirPath)
    const updatedDirCid = new CID(stats.hash)

    expect(stats.type).to.equal('hamt-sharded-directory')
    expect(updatedDirCid.toBaseEncodedString()).to.deep.equal(dirWithSomeFiles.toBaseEncodedString())
  })
})
