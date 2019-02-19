/* eslint-env mocha */
'use strict'

const { expectIsBandwidth } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stats.bwReadableStream', () => {
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

    it('should get bandwidth stats over readable stream', (done) => {
      const stream = ipfs.stats.bwReadableStream()

      stream.once('data', (data) => {
        expectIsBandwidth(null, data)
        stream.destroy()
        done()
      })
    })
  })
}
