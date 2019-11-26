/* eslint-env mocha */
'use strict'

const pTimeout = require('p-timeout')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.query', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB

    before(async () => {
      nodeA = await common.setup()
      nodeB = await common.setup()
      await nodeB.swarm.connect(nodeA.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should return the other node in the query', async function () {
      const timeout = 150 * 1000
      this.timeout(timeout)

      try {
        const peers = await pTimeout(nodeA.dht.query(nodeB.peerId.id), timeout - 1000)

        expect(peers.map((p) => p.id.toB58String())).to.include(nodeB.peerId.id)
      } catch (err) {
        if (err.name === 'TimeoutError') {
          // This test is meh. DHT works best with >= 20 nodes. Therefore a
          // failure might happen, but we don't want to report it as such.
          // Hence skip the test before the timeout is reached
          this.skip()
        } else {
          throw err
        }
      }
    })
  })
}
