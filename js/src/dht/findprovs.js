/* eslint-env mocha */
'use strict'

const waterfall = require('async/waterfall')
const CID = require('cids')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.findprovs', function () {
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

    it('should provide from one node and find it through another node', function (done) {
      this.timeout(80 * 1000)

      waterfall([
        (cb) => nodeB.object.new('unixfs-dir', cb),
        (dagNode, cb) => {
          const cidV0 = new CID(dagNode.toJSON().multihash)
          nodeB.dht.provide(cidV0, (err) => cb(err, cidV0))
        },
        (cidV0, cb) => nodeA.dht.findprovs(cidV0, cb),
        (provs, cb) => {
          expect(provs.map((p) => p.toB58String()))
            .to.eql([nodeB.peerId.id])
          cb()
        }
      ], done)
    })
  })
}
