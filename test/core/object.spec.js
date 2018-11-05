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
const IPFS = require('../../src/core')

describe('object', () => {
  let ipfsd, ipfs

  before(function (done) {
    this.timeout(20 * 1000)

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
      ipfs.object.put(Buffer.from(hat()), (err, dagNode) => {
        expect(err).to.not.exist()

        ipfs.object.get(dagNode.multihash, null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })

  describe('put', () => {
    it('should callback with error for invalid CID input', (done) => {
      ipfs.object.put({ multihash: 'INVALID CID' }, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })

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
        a: (cb) => ipfs.object.put(Buffer.from(hat()), cb),
        b: (cb) => ipfs.object.put(Buffer.from(hat()), cb)
      }, (err, nodes) => {
        expect(err).to.not.exist()

        const link = {
          name: nodes.b.name,
          multihash: nodes.b.multihash,
          size: nodes.b.size
        }

        ipfs.object.patch.addLink(nodes.a.multihash, link, null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })

  describe('patch.rmLink', () => {
    it('should not error when passed null options', (done) => {
      auto({
        nodeA: (cb) => ipfs.object.put(Buffer.from(hat()), cb),
        nodeB: (cb) => ipfs.object.put(Buffer.from(hat()), cb),
        nodeAWithLink: ['nodeA', 'nodeB', (res, cb) => {
          ipfs.object.patch.addLink(res.nodeA.multihash, {
            name: res.nodeB.name,
            multihash: res.nodeB.multihash,
            size: res.nodeB.size
          }, cb)
        }]
      }, (err, res) => {
        expect(err).to.not.exist()

        const link = res.nodeAWithLink.links[0]
        ipfs.object.patch.rmLink(res.nodeAWithLink.multihash, link, null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })

  describe('patch.appendData', () => {
    it('should not error when passed null options', (done) => {
      ipfs.object.put(Buffer.from(hat()), null, (err, dagNode) => {
        expect(err).to.not.exist()

        ipfs.object.patch.appendData(dagNode.multihash, Buffer.from(hat()), null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })

  describe('patch.setData', () => {
    it('should not error when passed null options', (done) => {
      ipfs.object.put(Buffer.from(hat()), null, (err, dagNode) => {
        expect(err).to.not.exist()

        ipfs.object.patch.setData(dagNode.multihash, Buffer.from(hat()), null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })
})
