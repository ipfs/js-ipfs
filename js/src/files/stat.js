/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.stat', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    before((done) => ipfs.files.add(fixtures.smallFile.data, done))

    after((done) => common.teardown(done))

    it('should not stat not found file/dir, expect error', function (done) {
      const testDir = `/test-${hat()}`

      ipfs.files.stat(`${testDir}/404`, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should stat file', function (done) {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, { p: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs.files.stat(`${testDir}/b`, (err, stat) => {
          expect(err).to.not.exist()
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
          done()
        })
      })
    })

    it('should stat dir', function (done) {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, { p: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs.files.stat(testDir, (err, stat) => {
          expect(err).to.not.exist()
          expect(stat).to.include({
            type: 'directory',
            blocks: 1,
            size: 0,
            hash: 'QmQGn7EvzJZRbhcwHrp4UeMeS56WsLmrey9JhfkymjzXQu',
            cumulativeSize: 118,
            withLocality: false
          })
          expect(stat.local).to.be.undefined()
          expect(stat.sizeLocal).to.be.undefined()
          done()
        })
      })
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal file', function (done) {
      ipfs.files.stat('/test/b', { withLocal: true }, (err, stat) => {
        expect(err).to.not.exist()
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
        done()
      })
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal dir', function (done) {
      ipfs.files.stat('/test', { withLocal: true }, (err, stat) => {
        expect(err).to.not.exist()
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
        done()
      })
    })

    it('should stat outside of mfs', function (done) {
      ipfs.files.stat('/ipfs/' + fixtures.smallFile.cid, (err, stat) => {
        expect(err).to.not.exist()
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
        done()
      })
    })
  })
}
