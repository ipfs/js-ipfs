/* eslint-env mocha */
'use strict'

const PeerInfo = require('peer-info')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { spawnNodesWithId } = require('../utils/spawn')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.swarm.addrs', function () {
    this.timeout(80 * 1000)

    let ipfsA, ipfsB

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
          ipfsA.swarm.connect(ipfsB.peerId.addresses[0], done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should get a list of node addresses', (done) => {
      ipfsA.swarm.addrs((err, peerInfos) => {
        expect(err).to.not.exist()
        expect(peerInfos).to.not.be.empty()
        expect(peerInfos).to.be.an('array')
        peerInfos.forEach(m => expect(PeerInfo.isPeerInfo(m)).to.be.true())
        done()
      })
    })

    it('should get a list of node addresses (promised)', () => {
      return ipfsA.swarm.addrs().then((peerInfos) => {
        expect(peerInfos).to.have.length.above(0)
      })
    })
  })
}
