/* eslint-env mocha */
'use strict'

const hat = require('hat')
const all = require('it-all')
const { fixtures } = require('../utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const createShardedDirectory = require('../utils/create-sharded-directory')
const CID = require('cids')
const mh = require('multihashes')
const Block = require('ipfs-block')
const crypto = require('crypto')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const smallFile = crypto.randomBytes(13)
  const largeFile = crypto.randomBytes(490668)

  describe('.files.stat', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn({
        args: common.opts.type === 'go' ? [] : ['--enable-sharding-experiment']
      })).api
    })

    before(async () => { await all(ipfs.add(fixtures.smallFile.data)) })

    after(() => common.clean())

    it('refuses to stat files with an empty path', async () => {
      try {
        await ipfs.files.stat('')
        throw new Error('No error was thrown for an empty path')
      } catch (err) {
        expect(err.message).to.contain('paths must not be empty')
      }
    })

    it('refuses to lists files with an invalid path', async () => {
      try {
        await ipfs.files.stat('not-valid')
        throw new Error('No error was thrown for an empty path')
      } catch (err) {
        expect(err.message).to.contain('paths must start with a leading /')
      }
    })

    it('fails to stat non-existent file', async () => {
      try {
        await ipfs.files.stat('/i-do-not-exist')
        throw new Error('No error was thrown for a non-existent file')
      } catch (err) {
        expect(err.message).to.contain('does not exist')
      }
    })

    it('stats an empty directory', async () => {
      const path = `/directory-${Math.random()}`

      await ipfs.files.mkdir(path)

      const stats = await ipfs.files.stat(path)
      expect(stats.size).to.equal(0)
      expect(stats.cumulativeSize).to.equal(4)
      expect(stats.blocks).to.equal(0)
      expect(stats.type).to.equal('directory')
    })

    it.skip('computes how much of the DAG is local', async () => {

    })

    it('stats a small file', async () => {
      const filePath = '/stat/small-file.txt'

      await ipfs.files.write(filePath, smallFile, {
        create: true,
        parents: true
      })

      const stats = await ipfs.files.stat(filePath)
      expect(stats.size).to.equal(smallFile.length)
      expect(stats.cumulativeSize).to.equal(71)
      expect(stats.blocks).to.equal(1)
      expect(stats.type).to.equal('file')
    })

    it('stats a large file', async () => {
      const filePath = '/stat/large-file.txt'

      await ipfs.files.write(filePath, largeFile, {
        create: true,
        parents: true
      })

      const stats = await ipfs.files.stat(filePath)
      expect(stats.size).to.equal(largeFile.length)
      expect(stats.cumulativeSize).to.equal(490800)
      expect(stats.blocks).to.equal(2)
      expect(stats.type).to.equal('file')
    })

    it('stats a raw node', async () => {
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

      const rawNodeStats = await ipfs.files.stat(`/ipfs/${child.Hash}`)

      expect(rawNodeStats.cid.toString()).to.equal(child.Hash.toString())
      expect(rawNodeStats.type).to.equal('file') // this is what go does
    })

    it('stats a raw node in an mfs directory', async () => {
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

      const dir = `/dir-with-raw-${Math.random()}`
      const path = `${dir}/raw-${Math.random()}`

      await ipfs.files.mkdir(dir)
      await ipfs.files.cp(`/ipfs/${child.Hash}`, path)

      const rawNodeStats = await ipfs.files.stat(path)

      expect(rawNodeStats.cid.toString()).to.equal(child.Hash.toString())
      expect(rawNodeStats.type).to.equal('file') // this is what go does
    })

    it('stats a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)

      const stats = await ipfs.files.stat(`${shardedDirPath}`)

      expect(stats.type).to.equal('hamt-sharded-directory')
      expect(stats.size).to.equal(0)
    })

    it('stats a file inside a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const files = []

      for await (const file of ipfs.files.ls(`${shardedDirPath}`)) {
        files.push(file)
      }

      const stats = await ipfs.files.stat(`${shardedDirPath}/${files[0].name}`)

      expect(stats.type).to.equal('file')
      expect(stats.size).to.equal(7)
    })

    it('stats a dag-cbor node', async () => {
      const path = '/cbor.node'
      const node = {}
      const cid = await ipfs.dag.put(node, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })
      await ipfs.files.cp(`/ipfs/${cid}`, path)

      const stats = await ipfs.files.stat(path)

      expect(stats.cid.toString()).to.equal(cid.toString())
    })

    it('stats an identity CID', async () => {
      const data = Buffer.from('derp')
      const path = `/test-${hat()}/identity.node`
      const cid = new CID(1, 'identity', mh.encode(data, 'identity'))
      await ipfs.block.put(new Block(data, cid))
      await ipfs.files.cp(`/ipfs/${cid}`, path, {
        parents: true
      })

      const stats = await ipfs.files.stat(path)

      expect(stats.cid.toString()).to.equal(cid.toString())
      expect(stats).to.have.property('size', data.length)
    })

    it('should stat file with mode', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const stat = await ipfs.files.stat(`${testDir}/b`)

      expect(stat).to.include({
        mode: 0o644
      })
    })

    it('should stat file with mtime', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), {
        create: true,
        mtime: {
          secs: 5,
          nsecs: 0
        }
      })

      const stat = await ipfs.files.stat(`${testDir}/b`)

      expect(stat).to.deep.include({
        mtime: {
          secs: 5,
          nsecs: 0
        }
      })
    })

    it('should stat dir', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true })

      const stat = await ipfs.files.stat(testDir)
      stat.cid = stat.cid.toString()

      expect(stat).to.include({
        type: 'directory',
        blocks: 1,
        size: 0,
        withLocality: false
      })
      expect(stat.local).to.be.undefined()
      expect(stat.sizeLocal).to.be.undefined()
    })

    it('should stat dir with mode', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      const stat = await ipfs.files.stat(testDir)

      expect(stat).to.include({
        mode: 0o755
      })
    })

    it('should stat dir with mtime', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, {
        parents: true,
        mtime: {
          secs: 5,
          nsecs: 0
        }
      })

      const stat = await ipfs.files.stat(testDir)

      expect(stat).to.deep.include({
        mtime: {
          secs: 5,
          nsecs: 0
        }
      })
    })

    it('should stat sharded dir with mode', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), {
        create: true,
        shardSplitThreshold: 0
      })

      const stat = await ipfs.files.stat(testDir)

      expect(stat).to.have.property('type', 'hamt-sharded-directory')
      expect(stat).to.include({
        mode: 0o755
      })
    })

    it('should stat sharded dir with mtime', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, {
        parents: true,
        mtime: {
          secs: 5,
          nsecs: 0
        }
      })
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), {
        create: true,
        shardSplitThreshold: 0
      })

      const stat = await ipfs.files.stat(testDir)

      expect(stat).to.have.property('type', 'hamt-sharded-directory')
      expect(stat).to.deep.include({
        mtime: {
          secs: 5,
          nsecs: 0
        }
      })
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal file', async function () {
      const stat = await ipfs.files.stat('/test/b', { withLocal: true })
      stat.cid = stat.cid.toString()

      expect(stat).to.eql({
        type: 'file',
        blocks: 1,
        size: 13,
        cid: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T',
        cumulativeSize: 71,
        withLocality: true,
        local: true,
        sizeLocal: 71
      })
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal dir', async function () {
      const stat = await ipfs.files.stat('/test', { withLocal: true })
      stat.cid = stat.cid.toString()

      expect(stat).to.eql({
        type: 'directory',
        blocks: 2,
        size: 0,
        cid: 'QmVrkkNurBCeJvPRohW5JTvJG4AxGrFg7FnmsZZUS6nJto',
        cumulativeSize: 216,
        withLocality: true,
        local: true,
        sizeLocal: 216
      })
    })

    it('should stat outside of mfs', async () => {
      const stat = await ipfs.files.stat('/ipfs/' + fixtures.smallFile.cid)
      stat.cid = stat.cid.toString()

      expect(stat).to.include({
        type: 'file',
        blocks: 0,
        size: 12,
        cid: fixtures.smallFile.cid,
        cumulativeSize: 20,
        withLocality: false
      })
      expect(stat.local).to.be.undefined()
      expect(stat.sizeLocal).to.be.undefined()
    })
  })
}
