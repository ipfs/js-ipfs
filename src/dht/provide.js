/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.provide', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(2, factory, (err, nodes) => {
          expect(err).to.not.exist()
          ipfs = nodes[0]
          connect(ipfs, nodes[1].peerId.addresses[0], done)
        })
      })
    })

    after(function (done) {
      this.timeout(50 * 1000)

      common.teardown(done)
    })

    it('should provide local CID', (done) => {
      ipfs.add(Buffer.from('test'), (err, res) => {
        if (err) return done(err)

        ipfs.dht.provide(new CID(res[0].hash), (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    it('should not provide if block not found locally', (done) => {
      const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

      ipfs.dht.provide(cid, (err) => {
        expect(err).to.exist()
        expect(err.message).to.include('not found locally')
        done()
      })
    })

    it('should allow multiple CIDs to be passed', (done) => {
      ipfs.add([
        { content: Buffer.from('t0') },
        { content: Buffer.from('t1') }
      ], (err, res) => {
        if (err) return done(err)

        ipfs.dht.provide([
          new CID(res[0].hash),
          new CID(res[1].hash)
        ], (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    it('should provide a CIDv1', (done) => {
      ipfs.add(Buffer.from('test'), { cidVersion: 1 }, (err, res) => {
        if (err) return done(err)

        const cid = new CID(res[0].hash)

        ipfs.dht.provide(cid, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
    it('should provide a CIDv1 string', (done) => {
      ipfs.add(Buffer.from('test'), { cidVersion: 1 }, (err, res) => {
        if (err) return done(err)

        const cid = res[0].hash

        ipfs.dht.provide(cid, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
    it('should error on non CID arg', (done) => {
      ipfs.dht.provide({}, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should error on array containing non CID arg', (done) => {
      ipfs.dht.provide([{}], (err) => {
        expect(err).to.exist()
        done()
      })
    })
  })
}
