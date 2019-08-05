/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const CID = require('cids')
const {
  FILE_TYPES
} = require('../src')
const createMfs = require('./helpers/create-mfs')
const createShardedDirectory = require('./helpers/create-sharded-directory')
const streamToArray = require('./helpers/stream-to-array')
const crypto = require('crypto')

describe('ls', () => {
  let mfs
  const largeFile = crypto.randomBytes(490668)

  before(async () => {
    mfs = await createMfs()
  })

  it('lists the root directory by default', async () => {
    const fileName = `small-file-${Math.random()}.txt`
    const content = Buffer.from('Hello world')

    await mfs.write(`/${fileName}`, content, {
      create: true
    })

    const files = await streamToArray(mfs.ls())

    expect(files.find(file => file.name === fileName)).to.be.ok()
  })

  it('refuses to lists files with an empty path', async () => {
    try {
      for await (const _ of mfs.ls('')) { // eslint-disable-line no-unused-vars
        // falala
      }

      throw new Error('No error was thrown for an empty path')
    } catch (err) {
      expect(err.code).to.equal('ERR_NO_PATH')
    }
  })

  it('refuses to lists files with an invalid path', async () => {
    try {
      for await (const _ of mfs.ls('not-valid')) { // eslint-disable-line no-unused-vars
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

    await mfs.write(`/${dirName}/${fileName}`, content, {
      create: true,
      parents: true
    })

    const files = await streamToArray(mfs.ls(`/${dirName}`))

    expect(files.find(file => file.name === fileName)).to.be.ok()
    expect(files.length).to.equal(1)
    expect(files[0].name).to.equal(fileName)
    expect(files[0].type).to.equal(FILE_TYPES.file)
    expect(files[0].size).to.equal(content.length)
    expect(CID.isCID(files[0].cid)).to.be.ok()
  })

  it('lists a file', async () => {
    const fileName = `small-file-${Math.random()}.txt`
    const content = Buffer.from('Hello world')

    await mfs.write(`/${fileName}`, content, {
      create: true
    })

    const files = await streamToArray(mfs.ls(`/${fileName}`))

    expect(files.length).to.equal(1)
    expect(files[0].name).to.equal(fileName)
    expect(files[0].type).to.equal(FILE_TYPES.file)
    expect(files[0].size).to.equal(content.length)
    expect(CID.isCID(files[0].cid)).to.be.ok()
  })

  it('fails to list non-existent file', async () => {
    try {
      for await (const _ of mfs.ls('/i-do-not-exist')) { // eslint-disable-line no-unused-vars
        // falala
      }

      throw new Error('No error was thrown for a non-existent file')
    } catch (err) {
      expect(err.code).to.equal('ERR_NOT_FOUND')
    }
  })

  it('lists a raw node', async () => {
    const filePath = '/stat/large-file.txt'

    await mfs.write(filePath, largeFile, {
      create: true,
      parents: true,
      rawLeaves: true
    })

    const stats = await mfs.stat(filePath)
    const node = await mfs.ipld.get(stats.cid)
    const child = node.Links[0]

    expect(child.Hash.codec).to.equal('raw')

    const files = await streamToArray(mfs.ls(`/ipfs/${child.Hash}`))

    expect(files.length).to.equal(1)
    expect(files[0].type).to.equal(0) // this is what go does
    expect(files[0].cid.toString()).to.equal(child.Hash.toString())
  })

  it('lists a raw node in an mfs directory', async () => {
    const filePath = '/stat/large-file.txt'

    await mfs.write(filePath, largeFile, {
      create: true,
      parents: true,
      rawLeaves: true
    })

    const stats = await mfs.stat(filePath)
    const cid = stats.cid
    const node = await mfs.ipld.get(cid)
    const child = node.Links[0]

    expect(child.Hash.codec).to.equal('raw')

    const dir = `/dir-with-raw-${Date.now()}`
    const path = `${dir}/raw-${Date.now()}`

    await mfs.mkdir(dir)
    await mfs.cp(`/ipfs/${child.Hash}`, path)

    const files = await streamToArray(mfs.ls(`/ipfs/${child.Hash}`))

    expect(files.length).to.equal(1)
    expect(files[0].type).to.equal(0) // this is what go does
    expect(files[0].cid.toString()).to.equal(child.Hash.toString())
  })

  it('lists a sharded directory contents', async () => {
    const shardSplitThreshold = 10
    const fileCount = 11
    const dirPath = await createShardedDirectory(mfs, shardSplitThreshold, fileCount)

    const files = await streamToArray(mfs.ls(dirPath))

    expect(files.length).to.equal(fileCount)

    files.forEach(file => {
      // should be a file
      expect(file.type).to.equal(0)
    })
  })

  it('lists a file inside a sharded directory directly', async () => {
    const dirPath = await createShardedDirectory(mfs)
    const files = await streamToArray(mfs.ls(dirPath))

    const filePath = `${dirPath}/${files[0].name}`

    // should be able to ls new file directly
    const file = await streamToArray(mfs.ls(filePath))

    expect(file.length).to.equal(1)
    expect(file[0].name).to.equal(files[0].name)
  })

  it('lists the contents of a directory inside a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const dirPath = `${shardedDirPath}/subdir-${Math.random()}`
    const fileName = `small-file-${Math.random()}.txt`

    await mfs.mkdir(`${dirPath}`)
    await mfs.write(`${dirPath}/${fileName}`, Buffer.from([0, 1, 2, 3]), {
      create: true
    })

    const files = await streamToArray(mfs.ls(dirPath))

    expect(files.length).to.equal(1)
    expect(files.filter(file => file.name === fileName)).to.be.ok()
  })
})
