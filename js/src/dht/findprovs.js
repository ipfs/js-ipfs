/* eslint-env mocha */
'use strict'

const multihashing = require('multihashing-async')
const waterfall = require('async/waterfall')
const CID = require('cids')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

function fakeCid (cb) {
  const bytes = Buffer.from(`TEST${Date.now()}`)
  multihashing(bytes, 'sha2-256', (err, mh) => {
    if (err) {
      cb(err)
    }
    cb(null, new CID(0, 'dag-pb', mh))
  })
}

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.findProvs', function () {
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

    after(function (done) {
      this.timeout(50 * 1000)

      common.teardown(done)
    })

    it('should provide from one node and find it through another node', function (done) {
      this.timeout(80 * 1000)

      waterfall([
        (cb) => nodeB.object.new('unixfs-dir', cb),
        (cid, cb) => {
          nodeB.dht.provide(cid, (err) => cb(err, cid))
        },
        (cid, cb) => nodeA.dht.findProvs(cid, cb),
        (provs, cb) => {
          expect(provs.map((p) => p.id.toB58String()))
            .to.eql([nodeB.peerId.id])
          cb()
        }
      ], done)
    })

    it('should take options to override timeout config', function (done) {
      const options = {
        timeout: 1
      }
      waterfall([
        (cb) => fakeCid(cb),
        (cidV0, cb) => nodeA.dht.findProvs(cidV0, options, (err) => {
          expect(err).to.exist()
          cb(null)
        })
      ], done)
    })
  })
}
