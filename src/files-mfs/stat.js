/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { fixtures } = require('../files-regular/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.stat', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn({
        args: common.opts.type === 'go' ? [] : ['--enable-sharding-experiment']
      })).api
    })
    before(async () => { await ipfs.add(fixtures.smallFile.data) })

    after(() => common.clean())

    it('should not stat not found file/dir, expect error', function () {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.stat(`${testDir}/404`)).to.eventually.be.rejected()
    })

    it('should stat file', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const stat = await ipfs.files.stat(`${testDir}/b`)

      expect(stat).to.include({
        type: 'file',
        blocks: 1,
        size: 13,
        hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T',
        cumulativeSize: 71,
        withLocality: false
      })
      expect(stat.local).to.be.undefined()
      expect(stat.sizeLocal).to.be.undefined()
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

      expect(stat).to.eql({
        type: 'file',
        blocks: 1,
        size: 13,
        hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T',
        cumulativeSize: 71,
        withLocality: true,
        local: true,
        sizeLocal: 71
      })
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal dir', async function () {
      const stat = await ipfs.files.stat('/test', { withLocal: true })

      expect(stat).to.eql({
        type: 'directory',
        blocks: 2,
        size: 0,
        hash: 'QmVrkkNurBCeJvPRohW5JTvJG4AxGrFg7FnmsZZUS6nJto',
        cumulativeSize: 216,
        withLocality: true,
        local: true,
        sizeLocal: 216
      })
    })

    it('should stat outside of mfs', async () => {
      const stat = await ipfs.files.stat('/ipfs/' + fixtures.smallFile.cid)

      expect(stat).to.include({
        type: 'file',
        blocks: 0,
        size: 12,
        hash: fixtures.smallFile.cid,
        cumulativeSize: 20,
        withLocality: false
      })
      expect(stat.local).to.be.undefined()
      expect(stat.sizeLocal).to.be.undefined()
    })
  })
}
