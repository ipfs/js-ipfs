/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.read', function () {
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

    it('should not read not found, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.read(`${testDir}/404`, (err, buf) => {
        expect(err).to.exist()
        expect(buf).to.not.exist()
        done()
      })
    })

    it('should read file', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, cb),
        (cb) => ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs.files.read(`${testDir}/a`, (err, buf) => {
          expect(err).to.not.exist()
          expect(buf).to.eql(Buffer.from('Hello, world!'))
          done()
        })
      })
    })
  })
}
