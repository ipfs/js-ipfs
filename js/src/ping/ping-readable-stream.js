/* eslint-env mocha */
'use strict'

const pump = require('pump')
const { Writable } = require('stream')
const series = require('async/series')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { expectIsPingResponse, isPong } = require('./utils')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pingReadableStream', function () {
    this.timeout(15 * 1000)

    let ipfsA
    let ipfsB

    before(function (done) {
      this.timeout(60 * 1000)

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

    it('should send the specified number of packets over readable stream', (done) => {
      let packetNum = 0
      const count = 3

      pump(
        ipfsA.pingReadableStream(ipfsB.peerId.id, { count }),
        new Writable({
          objectMode: true,
          write (res, enc, cb) {
            expect(res.success).to.be.true()
            // It's a pong
            if (isPong(res)) {
              packetNum++
            }

            cb()
          }
        }),
        (err) => {
          expect(err).to.not.exist()
          expect(packetNum).to.equal(count)
          done()
        }
      )
    })

    it('should fail when pinging an unknown peer over readable stream', (done) => {
      let messageNum = 0
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
      const count = 2

      pump(
        ipfsA.pingReadableStream(unknownPeerId, { count }),
        new Writable({
          objectMode: true,
          write (res, enc, cb) {
            expectIsPingResponse(res)
            messageNum++

            // First message should be "looking up" response
            if (messageNum === 1) {
              expect(res.text).to.include('Looking up')
            }

            // Second message should be a failure response
            if (messageNum === 2) {
              expect(res.success).to.be.false()
            }

            cb()
          }
        }),
        (err) => {
          expect(err).to.exist()
          done()
        }
      )
    })

    it('should fail when pinging an invalid peer over readable stream', (done) => {
      const invalidPeerId = 'not a peer ID'
      const count = 2

      pump(
        ipfsA.pingReadableStream(invalidPeerId, { count }),
        new Writable({
          objectMode: true,
          write: (chunk, enc, cb) => cb()
        }),
        (err) => {
          expect(err).to.exist()
          expect(err.message).to.include('failed to parse peer address')
          done()
        }
      )
    })
  })
}
