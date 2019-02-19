/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(100 * 1000)

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

    it('should list local addresses the node is listening on', (done) => {
      ipfs.swarm.localAddrs((err, multiaddrs) => {
        expect(err).to.not.exist()
        expect(multiaddrs).to.have.length.above(0)
        done()
      })
    })

    it('should list local addresses the node is listening on (promised)', () => {
      return ipfs.swarm.localAddrs().then((multiaddrs) => {
        expect(multiaddrs).to.have.length.above(0)
      })
    })
  })
}
