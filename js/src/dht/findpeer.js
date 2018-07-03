/* eslint-env mocha */
'use strict'

const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.findpeer', function () {
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

          connect(nodeB, nodeA.peerId.addresses[0], done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should find other peers', (done) => {
      nodeA.dht.findpeer(nodeB.peerId.id, (err, peer) => {
        expect(err).to.not.exist()
        // TODO upgrade the answer, format is weird
        expect(peer[0].Responses[0].ID).to.be.equal(nodeB.peerId.id)
        done()
      })
    })

    it('should fail to find other peer if peer does not exist', (done) => {
      nodeA.dht.findpeer('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ', (err, peer) => {
        expect(err).to.not.exist()
        expect(peer).to.not.exist()
        done()
      })
    })
  })
}
