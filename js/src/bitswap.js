/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const series = require('async/series')
const expect = chai.expect
const statsTests = require('./utils/stats')
const spawn = require('./utils/spawn')
chai.use(dirtyChai)
const CID = require('cids')

module.exports = (common) => {
  describe('.bitswap online', () => {
    let ipfsA
    let ipfsB
    let withGo
    let ipfsBId
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 250)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        series([
          (cb) => spawn.spawnNodeWithId(factory, (err, node) => {
            expect(err).to.not.exist()
            ipfsA = node
            withGo = node.peerId.agentVersion.startsWith('go-ipfs')
            cb()
          }),
          (cb) => spawn.spawnNodeWithId(factory, (err, node) => {
            expect(err).to.not.exist()
            ipfsB = node
            ipfsBId = node.peerId
            ipfsB.block.get(new CID(key))
              .then(() => {})
              .catch(() => {})
            ipfsA.swarm.connect(ipfsBId.addresses[0], (err) => {
              expect(err).to.not.exist()
              setTimeout(cb, 350)
            })
          })
        ], done)
      })
    })

    after((done) => common.teardown(done))

    it('.stat', (done) => {
      ipfsB.bitswap.stat((err, stats) => {
        expect(err).to.not.exist()
        statsTests.expectIsBitswap(err, stats)
        done()
      })
    })

    it('.wantlist', (done) => {
      ipfsB.bitswap.wantlist((err, list) => {
        expect(err).to.not.exist()
        expect(list.Keys).to.have.length(1)
        expect(list.Keys[0]['/']).to.equal(key)
        done()
      })
    })

    it('.wantlist peerid', (done) => {
      ipfsA.bitswap.wantlist(ipfsBId.id, (err, list) => {
        expect(err).to.not.exist()
        expect(list.Keys[0]['/']).to.equal(key)
        done()
      })
    })

    it('.unwant', function (done) {
      if (withGo) {
        this.skip()
      }
      ipfsB.bitswap.unwant(key, (err) => {
        expect(err).to.not.exist()
        ipfsB.bitswap.wantlist((err, list) => {
          expect(err).to.not.exist()
          expect(list.Keys).to.be.empty()
          done()
        })
      })
    })
  })

  describe('.bitswap offline', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          ipfs.id((err, id) => {
            expect(err).to.not.exist()
            ipfs.stop((err) => {
              // TODO: go-ipfs returns an error, https://github.com/ipfs/go-ipfs/issues/4078
              if (!id.agentVersion.startsWith('go-ipfs')) {
                expect(err).to.not.exist()
              }
              done()
            })
          })
        })
      })
    })

    it('.stat gives error while offline', (done) => {
      ipfs.bitswap.stat((err, stats) => {
        expect(err).to.exist()
        expect(stats).to.not.exist()
        done()
      })
    })

    it('.wantlist gives error if offline', (done) => {
      ipfs.bitswap.wantlist((err, list) => {
        expect(err).to.exist()
        expect(list).to.not.exist()
        done()
      })
    })

    it('.unwant gives error if offline', (done) => {
      const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'
      ipfs.bitswap.unwant(key, (err) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
