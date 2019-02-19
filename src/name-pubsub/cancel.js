/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const auto = require('async/auto')
const PeerId = require('peer-id')

const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.pubsub.cancel', function () {
    let ipfs
    let nodeId

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()

          ipfs = node
          nodeId = node.peerId.id

          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should return false when the name that is intended to cancel is not subscribed', function (done) {
      this.timeout(60 * 1000)

      ipfs.name.pubsub.cancel(nodeId, (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.property('canceled')
        expect(res.canceled).to.eql(false)

        done()
      })
    })

    it('should cancel a subscription correctly returning true', function (done) {
      this.timeout(300 * 1000)

      PeerId.create({ bits: 512 }, (err, peerId) => {
        expect(err).to.not.exist()

        const id = peerId.toB58String()
        const ipnsPath = `/ipns/${id}`

        ipfs.name.pubsub.subs((err, res) => {
          expect(err).to.not.exist()
          expect(res).to.be.an('array').that.does.not.include(ipnsPath)

          ipfs.name.resolve(id, (err) => {
            expect(err).to.exist()
            auto({
              subs1: (cb) => ipfs.name.pubsub.subs(cb),
              cancel: ['subs1', (_, cb) => ipfs.name.pubsub.cancel(ipnsPath, cb)],
              subs2: ['cancel', (_, cb) => ipfs.name.pubsub.subs(cb)]
            }, (err, res) => {
              expect(err).to.not.exist()
              expect(res).to.exist()
              expect(res.subs1).to.be.an('array').that.does.include(ipnsPath)
              expect(res.cancel).to.have.property('canceled')
              expect(res.cancel.canceled).to.eql(true)
              expect(res.subs2).to.be.an('array').that.does.not.include(ipnsPath)

              done()
            })
          })
        })
      })
    })
  })
}
