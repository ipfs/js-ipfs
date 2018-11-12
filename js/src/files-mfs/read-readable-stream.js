/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const bl = require('bl')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.readReadableStream', function () {
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

      const stream = ipfs.files.readReadableStream(`${testDir}/404`)

      stream.once('error', (err) => {
        expect(err).to.exist()
        expect(err.message).to.contain('does not exist')
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

        const stream = ipfs.files.readReadableStream(`${testDir}/a`)

        stream.pipe(bl((err, buf) => {
          expect(err).to.not.exist()
          expect(buf).to.eql(Buffer.from('Hello, world!'))
          done()
        }))
      })
    })
  })
}
