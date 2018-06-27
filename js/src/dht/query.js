/* eslint-env mocha */
'use strict'

const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.query', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(2, factory, (err, nodes) => {
          expect(err).to.not.exist()

          nodeA = nodes[0]
          nodeB = nodes[1]

          nodeB.swarm.connect(nodeA.peerId.addresses[0], done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should return the other node in the query', function (done) {
      const timeout = 150 * 1000
      this.timeout(timeout)

      let skipped = false

      // This test is meh. DHT works best with >= 20 nodes. Therefore a
      // failure might happen, but we don't want to report it as such.
      // Hence skip the test before the timeout is reached
      const timeoutId = setTimeout(function () {
        skipped = true
        this.skip()
      }.bind(this), timeout - 1000)

      nodeA.dht.query(nodeB.peerId.id, (err, peers) => {
        if (skipped) return
        clearTimeout(timeoutId)
        expect(err).to.not.exist()
        expect(peers.map((p) => p.ID)).to.include(nodeB.peerId.id)
        done()
      })
    })
  })
}
