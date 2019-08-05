/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const crypto = require('crypto')
const createMfs = require('./helpers/create-mfs')
const createShardedDirectory = require('./helpers/create-sharded-directory')
const mc = require('multicodec')

describe('stat', () => {
  let mfs
  const smallFile = crypto.randomBytes(13)
  const largeFile = crypto.randomBytes(490668)

  before(async () => {
    mfs = await createMfs()
  })

  it('refuses to stat files with an empty path', async () => {
    try {
      await mfs.stat('')
      throw new Error('No error was thrown for an empty path')
    } catch (err) {
      expect(err.message).to.contain('paths must not be empty')
    }
  })

  it('refuses to lists files with an invalid path', async () => {
    try {
      await mfs.stat('not-valid')
      throw new Error('No error was thrown for an empty path')
    } catch (err) {
      expect(err.message).to.contain('paths must start with a leading /')
    }
  })

  it('fails to stat non-existent file', async () => {
    try {
      await mfs.stat('/i-do-not-exist')
      throw new Error('No error was thrown for a non-existent file')
    } catch (err) {
      expect(err.message).to.contain('does not exist')
    }
  })

  it('stats an empty directory', async () => {
    const path = `/directory-${Math.random()}`

    await mfs.mkdir(path)

    const stats = await mfs.stat(path)
    expect(stats.size).to.equal(0)
    expect(stats.cumulativeSize).to.equal(4)
    expect(stats.blocks).to.equal(0)
    expect(stats.type).to.equal('directory')
  })

  it.skip('computes how much of the DAG is local', async () => {

  })

  it('stats a small file', async () => {
    const filePath = '/stat/small-file.txt'

    await mfs.write(filePath, smallFile, {
      create: true,
      parents: true
    })

    const stats = await mfs.stat(filePath)
    expect(stats.size).to.equal(smallFile.length)
    expect(stats.cumulativeSize).to.equal(71)
    expect(stats.blocks).to.equal(1)
    expect(stats.type).to.equal('file')
  })

  it('stats a large file', async () => {
    const filePath = '/stat/large-file.txt'

    await mfs.write(filePath, largeFile, {
      create: true,
      parents: true
    })

    const stats = await mfs.stat(filePath)
    expect(stats.size).to.equal(largeFile.length)
    expect(stats.cumulativeSize).to.equal(490800)
    expect(stats.blocks).to.equal(2)
    expect(stats.type).to.equal('file')
  })

  it('stats a raw node', async () => {
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

    const rawNodeStats = await mfs.stat(`/ipfs/${child.Hash}`)

    expect(rawNodeStats.cid.toString()).to.equal(child.Hash.toString())
    expect(rawNodeStats.type).to.equal('file') // this is what go does
  })

  it('stats a raw node in an mfs directory', async () => {
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

    const dir = `/dir-with-raw-${Date.now()}`
    const path = `${dir}/raw-${Date.now()}`

    await mfs.mkdir(dir)
    await mfs.cp(`/ipfs/${child.Hash}`, path)

    const rawNodeStats = await mfs.stat(path)

    expect(rawNodeStats.cid.toString()).to.equal(child.Hash.toString())
    expect(rawNodeStats.type).to.equal('file') // this is what go does
  })

  it('stats a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)

    const stats = await mfs.stat(`${shardedDirPath}`)

    expect(stats.type).to.equal('hamt-sharded-directory')
    expect(stats.size).to.equal(0)
  })

  it('stats a file inside a sharded directory', async () => {
    const shardedDirPath = await createShardedDirectory(mfs)
    const files = []

    for await (const file of mfs.ls(`${shardedDirPath}`)) {
      files.push(file)
    }

    const stats = await mfs.stat(`${shardedDirPath}/${files[0].name}`)

    expect(stats.type).to.equal('file')
    expect(stats.size).to.equal(7)
  })

  it('stats a dag-cbor node', async () => {
    const path = '/cbor.node'
    const node = {}
    const cid = await mfs.ipld.put(node, mc.getNumber('dag-cbor'))
    await mfs.cp(`/ipfs/${cid}`, path)

    const stats = await mfs.stat(path)

    expect(stats.cid.toString()).to.equal(cid.toString())
  })
})
