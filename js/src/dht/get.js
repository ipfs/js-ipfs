/* eslint-env mocha */
'use strict'

const waterfall = require('async/waterfall')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.get', function () {
    this.timeout(80 * 1000)

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

          nodeA.swarm.connect(nodeB.peerId.addresses[0], done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should error when getting a non-existent key from the DHT', (done) => {
      nodeA.dht.get('non-existing', { timeout: '100ms' }, (err, value) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('should get a value after it was put on another node', function (done) {
      this.timeout(80 * 1000)

      // TODO - this test needs to keep tryingl instead of the setTimeout
      waterfall([
        (cb) => nodeB.object.new('unixfs-dir', cb),
        (dagNode, cb) => setTimeout(() => cb(null, dagNode), 20000),
        (dagNode, cb) => {
          const multihash = dagNode.toJSON().multihash

          nodeA.dht.get(multihash, cb)
        },
        (result, cb) => {
          expect(result).to.eql('')
          cb()
        }
      ], done)
    })
  })
}
