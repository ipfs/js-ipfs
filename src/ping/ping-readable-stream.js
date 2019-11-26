/* eslint-env mocha */
'use strict'

const pump = require('pump')
const { Writable } = require('stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isPong } = require('./utils.js')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pingReadableStream', function () {
    this.timeout(60 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = await common.setup()
      ipfsB = await common.setup()
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should send the specified number of packets over readable stream', () => {
      let packetNum = 0
      const count = 3

      return new Promise((resolve, reject) => {
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
            resolve()
          }
        )
      })
    })

    it('should fail when pinging peer that is not available over readable stream', () => {
      const unknownPeerId = 'QmUmaEnH1uMmvckMZbh3yShaasvELPW4ZLPWnB4entMTEn'

      return new Promise((resolve, reject) => {
        pump(
          ipfsA.pingReadableStream(unknownPeerId, {}),
          new Writable({
            objectMode: true,
            write: (res, enc, cb) => cb()
          }),
          (err) => {
            expect(err).to.exist()
            resolve()
          }
        )
      })
    })

    it('should fail when pinging an invalid peer id over readable stream', () => {
      const invalidPeerId = 'not a peer ID'

      return new Promise((resolve, reject) => {
        pump(
          ipfsA.pingReadableStream(invalidPeerId, {}),
          new Writable({
            objectMode: true,
            write: (chunk, enc, cb) => cb()
          }),
          (err) => {
            expect(err).to.exist()
            resolve()
          }
        )
      })
    })
  })
}
