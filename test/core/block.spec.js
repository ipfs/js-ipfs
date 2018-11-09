/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const hat = require('hat')

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

describe('block', () => {
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
      ipfs.block.get('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })
  })

  describe('put', () => {
    it('should not error when passed null options', (done) => {
      ipfs.block.put(Buffer.from(hat()), null, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })

  describe('rm', () => {
    it('should callback with error for invalid CID input', (done) => {
      ipfs.block.rm('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })
  })

  describe('stat', () => {
    it('should callback with error for invalid CID input', (done) => {
      ipfs.block.stat('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })

    it('should not error when passed null options', (done) => {
      ipfs.block.put(Buffer.from(hat()), (err, block) => {
        expect(err).to.not.exist()

        ipfs.block.stat(block.cid, null, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })
  })
})
