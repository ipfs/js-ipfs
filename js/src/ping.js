/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const pull = require('pull-stream')
const pump = require('pump')
const { Writable } = require('stream')
const series = require('async/series')
const { spawnNodesWithId } = require('./utils/spawn')
const { waitUntilConnected } = require('./utils/connections')

const expect = chai.expect
chai.use(dirtyChai)

function expectIsPingResponse (obj) {
  expect(obj).to.have.a.property('success')
  expect(obj).to.have.a.property('time')
  expect(obj).to.have.a.property('text')
  expect(obj.success).to.be.a('boolean')
  expect(obj.time).to.be.a('number')
  expect(obj.text).to.be.a('string')
}

// Determine if a ping response object is a pong, or something else, like a status message
function isPong (pingResponse) {
  return Boolean(pingResponse && pingResponse.success && !pingResponse.text)
}

module.exports = (common) => {
  describe('.ping', function () {
    let ipfsdA
    let ipfsdB

    before(function (done) {
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        if (err) return done(err)

        series([
          (cb) => {
            spawnNodesWithId(2, factory, (err, nodes) => {
              if (err) return cb(err)
              ipfsdA = nodes[0]
              ipfsdB = nodes[1]
              cb()
            })
          },
          (cb) => waitUntilConnected(ipfsdA, ipfsdB, cb)
        ], done)
      })
    })

    after((done) => common.teardown(done))

    describe('.ping', function () {
      this.timeout(15 * 1000)

      it('sends the specified number of packets', (done) => {
        const count = 3
        ipfsdA.ping(ipfsdB.peerId.id, { count }, (err, responses) => {
          expect(err).to.not.exist()
          responses.forEach(expectIsPingResponse)
          const pongs = responses.filter(isPong)
          expect(pongs.length).to.equal(count)
          done()
        })
      })

      it('fails when pinging an unknown peer', (done) => {
        const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
        const count = 2

        ipfsdA.ping(unknownPeerId, { count }, (err, responses) => {
          expect(err).to.exist()
          expect(responses[0].text).to.include('Looking up')
          expect(responses[1].success).to.be.false()
          done()
        })
      })

      it('fails when pinging an invalid peer', (done) => {
        const invalidPeerId = 'not a peer ID'
        const count = 2
        ipfsdA.ping(invalidPeerId, { count }, (err, responses) => {
          expect(err).to.exist()
          expect(err.message).to.include('failed to parse peer address')
          done()
        })
      })
    })

    describe('.pingPullStream', function () {
      this.timeout(15 * 1000)

      it('sends the specified number of packets', (done) => {
        let packetNum = 0
        const count = 3
        pull(
          ipfsdA.pingPullStream(ipfsdB.peerId.id, { count }),
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

      it('fails when pinging an unknown peer', (done) => {
        let messageNum = 0
        const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
        const count = 2
        pull(
          ipfsdA.pingPullStream(unknownPeerId, { count }),
          pull.drain((res) => {
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
          }, (err) => {
            expect(err).to.exist()
            done()
          })
        )
      })

      it('fails when pinging an invalid peer', (done) => {
        const invalidPeerId = 'not a peer ID'
        const count = 2
        pull(
          ipfsdA.pingPullStream(invalidPeerId, { count }),
          pull.collect((err) => {
            expect(err).to.exist()
            expect(err.message).to.include('failed to parse peer address')
            done()
          })
        )
      })
    })

    describe('.pingReadableStream', function () {
      this.timeout(15 * 1000)

      it('sends the specified number of packets', (done) => {
        let packetNum = 0
        const count = 3

        pump(
          ipfsdA.pingReadableStream(ipfsdB.peerId.id, { count }),
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

      it('fails when pinging an unknown peer', (done) => {
        let messageNum = 0
        const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'
        const count = 2

        pump(
          ipfsdA.pingReadableStream(unknownPeerId, { count }),
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

      it('fails when pinging an invalid peer', (done) => {
        const invalidPeerId = 'not a peer ID'
        const count = 2

        pump(
          ipfsdA.pingReadableStream(invalidPeerId, { count }),
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
  })
}
