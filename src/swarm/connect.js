/* eslint-env mocha */
'use strict'

const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.swarm.connect', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(100 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(2, factory, (err, nodes) => {
          expect(err).to.not.exist()
          ipfsA = nodes[0]
          ipfsB = nodes[1]
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should connect to a peer', (done) => {
      ipfsA.swarm.connect(ipfsB.peerId.addresses[0], done)
    })

    it('should connect to a peer (promised)', () => {
      return ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })
  })
}
