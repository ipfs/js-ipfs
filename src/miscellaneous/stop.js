/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stop', () => {
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

    after((done) => {
      common.teardown(done)
    })

    // must be last test to run
    it('should stop the node', function (done) {
      this.timeout(10 * 1000)

      ipfs.stop((err) => {
        expect(err).to.not.exist()

        // Trying to stop an already stopped node should return an error
        // as the node can't respond to requests anymore
        ipfs.stop((err) => {
          expect(err).to.exist()
          done()
        })
      })
    })
  })
}
