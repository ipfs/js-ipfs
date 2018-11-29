/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')
const series = require('async/series')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isPong } = require('./utils.js')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pingPullStream', function () {
    // TODO revisit when https://github.com/ipfs/go-ipfs/issues/5799 is resolved
    this.timeout(2 * 60 * 1000)

    let ipfsA
    let ipfsB

    before(function (done) {
      common.setup((err, factory) => {
        if (err) return done(err)

        series([
          (cb) => {
            spawnNodesWithId(2, factory, (err, nodes) => {
              if (err) return cb(err)
              ipfsA = nodes[0]
              ipfsB = nodes[1]
              cb()
            })
          },
          (cb) => connect(ipfsA, ipfsB.peerId.addresses[0], cb)
        ], done)
      })
    })

    after((done) => common.teardown(done))

    it('should send the specified number of packets over pull stream', (done) => {
      let packetNum = 0
      const count = 3
      pull(
        ipfsA.pingPullStream(ipfsB.peerId.id, { count }),
        pull.drain((res) => {
          expect(res.success).to.be.true()
          // It's a pong
          if (isPong(res)) {
            packetNum++
          }
        }, (err) => {
          expect(err).to.not.exist()
          expect(packetNum).to.equal(count)
          done()
        })
      )
    })

    it('should fail when pinging an unknown peer over pull stream', (done) => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2
      pull(
        ipfsA.pingPullStream(unknownPeerId, { count }),
        pull.collect((err, results) => {
          expect(err).to.exist()
          done()
        })
      )
    })

    it('should fail when pinging an invalid peer id over pull stream', (done) => {
      const invalidPeerId = 'not a peer ID'
      const count = 2
      pull(
        ipfsA.pingPullStream(invalidPeerId, { count }),
        pull.collect((err, results) => {
          expect(err).to.exist()
          done()
        })
      )
    })
  })
}
