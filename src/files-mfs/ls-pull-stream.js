/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const pull = require('pull-stream/pull')
const onEnd = require('pull-stream/sinks/on-end')
const collect = require('pull-stream/sinks/collect')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.lsPullStream', function () {
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

    it('should not ls not found file/dir, expect error', (done) => {
      const testDir = `/test-${hat()}`

      pull(
        ipfs.files.lsPullStream(`${testDir}/404`),
        onEnd((err) => {
          expect(err).to.exist()
          expect(err.message).to.include('does not exist')
          done()
        })
      )
    })

    it('should ls directory', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(`${testDir}/lv1`, { p: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        pull(
          ipfs.files.lsPullStream(testDir),
          collect((err, entries) => {
            expect(err).to.not.exist()
            expect(entries.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
              { name: 'b', type: 0, size: 0, hash: '' },
              { name: 'lv1', type: 0, size: 0, hash: '' }
            ])
            done()
          })
        )
      })
    })

    it('should ls directory with long option', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(`${testDir}/lv1`, { p: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        pull(
          ipfs.files.lsPullStream(testDir, { long: true }),
          collect((err, entries) => {
            expect(err).to.not.exist()
            expect(entries.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
              {
                name: 'b',
                type: 0,
                size: 13,
                hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T'
              },
              {
                name: 'lv1',
                type: 1,
                size: 0,
                hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
              }
            ])
            done()
          })
        )
      })
    })
  })
}
