/* eslint-env mocha */
'use strict'

const { Readable } = require('readable-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { fixtures } = require('./utils')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromStream', function () {
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

    it('should add from a stream', (done) => {
      const stream = new Readable({
        read () {
          this.push(fixtures.bigFile.data)
          this.push(null)
        }
      })

      ipfs.addFromStream(stream, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.equal(1)
        expect(result[0].hash).to.equal(fixtures.bigFile.cid)
        done()
      })
    })
  })
}
