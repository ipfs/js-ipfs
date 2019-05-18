/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const multihash = require('multihashes')
const createMfs = require('./helpers/create-mfs')
const cidAtPath = require('./helpers/cid-at-path')
const createShardedDirectory = require('./helpers/create-sharded-directory')
const all = require('async-iterator-all')

describe('mkdir', () => {
  let mfs

  before(async () => {
    mfs = await createMfs()
  })

  it('requires a directory', async () => {
    try {
      await mfs.mkdir('')
      throw new Error('No error was thrown when creating an directory with an empty path')
    } catch (err) {
      expect(err.message).to.contain('no path given')
    }
  })

  it('refuses to create a directory without a leading slash', async () => {
    try {
      await mfs.mkdir('foo')
      throw new Error('No error was thrown when creating an directory with no leading slash')
    } catch (err) {
      expect(err.code).to.equal('ERR_INVALID_PATH')
    }
  })

  it('refuses to recreate the root directory when -p is false', async () => {
    try {
      await mfs.mkdir('/', {
        parents: false
      })
      throw new Error('No error was thrown when creating the root directory without -p')
    } catch (err) {
      expect(err.message).to.contain("cannot create directory '/'")
    }
  })

  it('refuses to create a nested directory when -p is false', async () => {
    try {
      await mfs.mkdir('/foo/bar/baz', {
        parents: false
      })
      throw new Error('No error was thrown when creating intermediate directories without -p')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('creates a directory', async () => {
    const path = '/foo'

    await mfs.mkdir(path, {})

    const stats = await mfs.stat(path)
    expect(stats.type).to.equal('directory')

    const files = await all(mfs.ls(path))

    expect(files.length).to.equal(0)
  })

  it('refuses to create a directory that already exists', async () => {
    const path = '/qux/quux/quuux'

    await mfs.mkdir(path, {
      parents: true
    })

    try {
      await mfs.mkdir(path, {
        parents: false
      })

      throw new Error('Did not refuse to create a path that already exists')
    } catch (err) {
      expect(err.code).to.equal('ERR_ALREADY_EXISTS')
    }
  })

  it('does not error when creating a directory that already exists and parents is true', async () => {
    const path = '/qux/quux/quuux'

    await mfs.mkdir(path, {
      parents: true
    })

    await mfs.mkdir(path, {
      parents: true
    })
  })

  it('creates a nested directory when -p is true', async () => {
    const path = '/foo/bar/baz'

    await mfs.mkdir(path, {
      parents: true
    })

    const files = await all(mfs.ls(path))

    expect(files.length).to.equal(0)
  })

  it('creates nested directories', async () => {
    await mfs.mkdir('/nested-dir')
    await mfs.mkdir('/nested-dir/baz')

    const files = await all(mfs.ls('/nested-dir'))

    expect(files.length).to.equal(1)
  })

  it('creates a nested directory with a different CID version to the parent', async () => {
    const directory = `cid-versions-${Math.random()}`
    const directoryPath = `/${directory}`
    const subDirectory = `cid-versions-${Math.random()}`
    const subDirectoryPath = `${directoryPath}/${subDirectory}`

    await mfs.mkdir(directoryPath, {
      cidVersion: 0
    })

    expect((await cidAtPath(directoryPath, mfs)).version).to.equal(0)

    await mfs.mkdir(subDirectoryPath, {
      cidVersion: 1
    })

    expect((await cidAtPath(subDirectoryPath, mfs)).version).to.equal(1)
  })

  it('creates a nested directory with a different hash function to the parent', async () => {
    const directory = `cid-versions-${Math.random()}`
    const directoryPath = `/${directory}`
    const subDirectory = `cid-versions-${Math.random()}`
    const subDirectoryPath = `${directoryPath}/${subDirectory}`

    await mfs.mkdir(directoryPath, {
      cidVersion: 0
    })

    expect((await cidAtPath(directoryPath, mfs)).version).to.equal(0)

    await mfs.mkdir(subDirectoryPath, {
      cidVersion: 1,
      hashAlg: 'sha2-512'
    })

    expect(multihash.decode((await cidAtPath(subDirectoryPath, mfs)).multihash).name).to.equal('sha2-512')
  })

  it('makes a directory inside a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const dirPath = `${shardedDirPath}/subdir-${Math.random()}`

    await mfs.mkdir(`${dirPath}`)

    expect((await mfs.stat(shardedDirPath)).type).to.equal('hamt-sharded-directory')
    expect((await mfs.stat(dirPath)).type).to.equal('directory')
  })
})
