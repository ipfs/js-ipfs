/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const series = require('async/series')
const loadFixture = require('aegir/fixtures')

const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

const fixture = Object.freeze({
  data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')
})

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.pubsub.cancel', function () {
    let ipfs
    let nodeId
    let value

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

          ipfs.add(fixture.data, { pin: false }, (err, res) => {
            expect(err).to.not.exist()

            value = res[0].path
            done()
          })
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
      const ipnsPath = `/ipns/${nodeId}`

      series([
        (cb) => ipfs.name.pubsub.subs(cb),
        (cb) => ipfs.name.publish(value, { resolve: false }, cb),
        (cb) => ipfs.name.resolve(nodeId, cb),
        (cb) => ipfs.name.pubsub.subs(cb),
        (cb) => ipfs.name.pubsub.cancel(ipnsPath, cb),
        (cb) => ipfs.name.pubsub.subs(cb)
      ], (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res[0]).to.eql([]) // initally empty
        expect(res[4]).to.have.property('canceled')
        expect(res[4].canceled).to.eql(true)
        expect(res[5]).to.be.an('array').that.does.not.include(ipnsPath)

        done()
      })
    })
  })
}
