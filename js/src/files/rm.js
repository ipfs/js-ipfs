/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.rm', function () {
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

    after((done) => common.teardown(done))

    it('should not remove not found file/dir, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.rm(`${testDir}/a`, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should remove file, expect no error', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, { p: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/c`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs.files.rm(`${testDir}/c`, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    it('should remove dir, expect no error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.mkdir(`${testDir}/lv1/lv2`, { p: true }, (err) => {
        expect(err).to.not.exist()

        ipfs.files.rm(`${testDir}/lv1/lv2`, { recursive: true }, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })
}
