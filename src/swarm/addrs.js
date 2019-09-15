/* eslint-env mocha */
'use strict'

const PeerInfo = require('peer-info')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.swarm.addrs', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.teardown())

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
