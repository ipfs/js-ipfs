/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const waterfall = require('async/waterfall')
const series = require('async/series')
const parallel = require('async/parallel')
const CID = require('cids')

function spawnWithId (factory, callback) {
  waterfall([
    (cb) => factory.spawnNode(cb),
    (node, cb) => node.id((err, peerId) => {
      if (err) {
        return cb(err)
      }
      node.peerId = peerId
      cb(null, node)
    })
  ], callback)
}

module.exports = (common) => {
  describe('.dht', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeB
    let nodeC

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        series([
          (cb) => spawnWithId(factory, cb),
          (cb) => spawnWithId(factory, cb),
          (cb) => spawnWithId(factory, cb)
        ], (err, nodes) => {
          expect(err).to.not.exist()

          nodeA = nodes[0]
          nodeB = nodes[1]
          nodeC = nodes[2]

          parallel([
            (cb) => nodeA.swarm.connect(nodeB.peerId.addresses[0], cb),
            (cb) => nodeB.swarm.connect(nodeC.peerId.addresses[0], cb),
            (cb) => nodeC.swarm.connect(nodeA.peerId.addresses[0], cb)
          ], done)
        })
      })
    })

    after((done) => common.teardown(done))

    describe('.get and .put', () => {
      it('errors when getting a non-existent key from the DHT', (done) => {
        nodeA.dht.get('non-existing', { timeout: '100ms' }, (err, value) => {
          expect(err).to.be.an.instanceof(Error)
          done()
        })
      })

      // TODO: fix - go-ipfs errors with  Error: key was not found (type 6)
      // https://github.com/ipfs/go-ipfs/issues/3862
      it.skip('fetches value after it was put on another node', (done) => {
        waterfall([
          (cb) => nodeB.object.new('unixfs-dir', cb),
          (node, cb) => setTimeout(() => cb(null, node), 1000),
          (node, cb) => {
            const multihash = node.toJSON().multihash

            nodeA.dht.get(multihash, cb)
          },
          (result, cb) => {
            expect(result).to.eql('')
            cb()
          }
        ], done)
      })

      it('Promises support', (done) => {
        nodeA.dht.get('non-existing', { timeout: '100ms' })
          .catch((err) => {
            expect(err).to.exist()
            done()
          })
      })
    })

    describe('.findpeer', () => {
      it('finds other peers', (done) => {
        nodeA.dht.findpeer(nodeC.peerId.id, (err, peer) => {
          expect(err).to.not.exist()
          // TODO upgrade the answer, format is weird
          expect(peer[0].Responses[0].ID).to.be.equal(nodeC.peerId.id)
          done()
        })
      })

      // TODO checking what is exactly go-ipfs returning
      // https://github.com/ipfs/go-ipfs/issues/3862#issuecomment-294168090
      it.skip('fails to find other peer, if peer doesnt exist()s', (done) => {
        nodeA.dht.findpeer('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ', (err, peer) => {
          expect(err).to.not.exist()
          expect(peer).to.be.equal(null)
          done()
        })
      })
    })

    describe('.provide', () => {
      it('regular', (done) => {
        // TODO recheck this test, should it provide or not if block is not available? go-ipfs does provide.
        const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

        nodeC.dht.provide(cid, done)
      })

      it.skip('recursive', () => {})
    })

    describe.skip('findprovs', () => {
      it('basic', (done) => {
        const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxxx')

        waterfall([
          (cb) => nodeB.dht.provide(cid, cb),
          (cb) => nodeC.dht.findprovs(cid, cb),
          (provs, cb) => {
            expect(provs.map((p) => p.toB58String()))
              .to.eql([nodeB.peerId.id])
            cb()
          }
        ], done)
      })

      it('Promises support', (done) => {
        nodeB.dht.findprovs('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
          .then((res) => {
            expect(res).to.be.an('array')
            done()
          })
          .catch((err) => done(err))
      })
    })

    describe('.query', () => {
      it('returns the other node in the query', (done) => {
        nodeA.dht.query(nodeC.peerId.id, (err, peers) => {
          expect(err).to.not.exist()
          expect(peers.map((p) => p.ID)).to.include(nodeC.peerId.id)
          done()
        })
      })
    })
  })
}
