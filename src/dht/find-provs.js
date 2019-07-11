/* eslint-env mocha */
'use strict'

const multihashing = require('multihashing-async')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
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
    let nodeC

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(3, factory, (err, nodes) => {
          expect(err).to.not.exist()

          nodeA = nodes[0]
          nodeB = nodes[1]
          nodeC = nodes[2]

          parallel([
            (cb) => connect(nodeB, nodeA.peerId.addresses[0], cb),
            (cb) => connect(nodeC, nodeB.peerId.addresses[0], cb)
          ], done)
        })
      })
    })

    let providedCid
    before('add providers for the same cid', function (done) {
      this.timeout(10 * 1000)
      parallel([
        (cb) => nodeB.object.new('unixfs-dir', cb),
        (cb) => nodeC.object.new('unixfs-dir', cb)
      ], (err, cids) => {
        if (err) return done(err)
        providedCid = cids[0]
        parallel([
          (cb) => nodeB.dht.provide(providedCid, cb),
          (cb) => nodeC.dht.provide(providedCid, cb)
        ], done)
      })
    })

    after(function (done) {
      this.timeout(50 * 1000)

      common.teardown(done)
    })

    it('should be able to find providers', function (done) {
      this.timeout(20 * 1000)

      waterfall([
        (cb) => nodeA.dht.findProvs(providedCid, cb),
        (provs, cb) => {
          const providerIds = provs.map((p) => p.id.toB58String())
          expect(providerIds).to.have.members([
            nodeB.peerId.id,
            nodeC.peerId.id
          ])
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
