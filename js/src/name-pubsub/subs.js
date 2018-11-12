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

  describe('.name.pubsub.subs', function () {
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

    it('should get an empty array as a result of subscriptions before any resolve', function (done) {
      this.timeout(60 * 1000)

      ipfs.name.pubsub.subs((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.eql([])

        done()
      })
    })

    it('should get the list of subscriptions updated after a resolve', function (done) {
      this.timeout(300 * 1000)

      series([
        (cb) => ipfs.name.pubsub.subs(cb),
        (cb) => ipfs.name.publish(value, { resolve: false }, cb),
        (cb) => ipfs.name.resolve(nodeId, cb),
        (cb) => ipfs.name.pubsub.subs(cb)
      ], (err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res[0]).to.eql([]) // initally empty
        expect(res[3]).to.be.an('array').that.does.include(`/ipns/${nodeId}`)

        done()
      })
    })
  })
}
