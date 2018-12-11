/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const hat = require('hat')
const IPFSFactory = require('ipfsd-ctl')
const auto = require('async/auto')
const waterfall = require('async/waterfall')
const IPFS = require('../../src/core')

describe('object', () => {
  let ipfsd, ipfs

  before(function (done) {
    this.timeout(50 * 1000)

    const factory = IPFSFactory.create({ type: 'proc' })

    factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 },
      config: { Bootstrap: [] }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = _ipfsd.api
      done()
    })
  })

  after((done) => {
    if (ipfsd) {
      ipfsd.stop(done)
    } else {
      done()
    }
  })

  describe('get', () => {
    it('should callback with error for invalid CID input', (done) => {
      ipfs.object.get('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })

    it('should not error when passed null options', (done) => {
      ipfs.object.put(Buffer.from(hat()), (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.get(cid, null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })

  describe('put', () => {
    it('should not error when passed null options', (done) => {
      ipfs.object.put(Buffer.from(hat()), null, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })

  describe('patch.addLink', () => {
    it('should not error when passed null options', (done) => {
      auto({
        a: (cb) => {
          waterfall([
            (done) => ipfs.object.put(Buffer.from(hat()), done),
            (cid, done) => ipfs.object.get(cid, (err, node) => done(err, { node, cid }))
          ], cb)
        },
        b: (cb) => {
          waterfall([
            (done) => ipfs.object.put(Buffer.from(hat()), done),
            (cid, done) => ipfs.object.get(cid, (err, node) => done(err, { node, cid }))
          ], cb)
        }
      }, (err, results) => {
        expect(err).to.not.exist()

        const link = {
          name: 'link-name',
          cid: results.b.cid,
          size: results.b.node.size
        }

        ipfs.object.patch.addLink(results.a.cid, link, null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })

  describe('patch.rmLink', () => {
    it('should not error when passed null options', (done) => {
      auto({
        nodeA: (cb) => {
          waterfall([
            (done) => ipfs.object.put(Buffer.from(hat()), done),
            (cid, done) => ipfs.object.get(cid, (err, node) => done(err, { node, cid }))
          ], cb)
        },
        nodeB: (cb) => {
          waterfall([
            (done) => ipfs.object.put(Buffer.from(hat()), done),
            (cid, done) => ipfs.object.get(cid, (err, node) => done(err, { node, cid }))
          ], cb)
        },
        nodeAWithLink: ['nodeA', 'nodeB', (res, cb) => {
          waterfall([
            (done) => ipfs.object.patch.addLink(res.nodeA.cid, {
              name: res.nodeB.node.name,
              multihash: res.nodeB.cid,
              size: res.nodeB.node.size
            }, done),
            (cid, done) => ipfs.object.get(cid, (err, node) => done(err, { node, cid }))
          ], cb)
        }]
      }, (err, res) => {
        expect(err).to.not.exist()

        const link = res.nodeAWithLink.node.links[0]
        ipfs.object.patch.rmLink(res.nodeAWithLink.cid, link, null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })

  describe('patch.appendData', () => {
    it('should not error when passed null options', (done) => {
      ipfs.object.put(Buffer.from(hat()), null, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.patch.appendData(cid, Buffer.from(hat()), null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })

  describe('patch.setData', () => {
    it('should not error when passed null options', (done) => {
      ipfs.object.put(Buffer.from(hat()), null, (err, cid) => {
        expect(err).to.not.exist()

        ipfs.object.patch.setData(cid, Buffer.from(hat()), null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })
})
