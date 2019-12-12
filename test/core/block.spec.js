/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const hat = require('hat')
const factory = require('../utils/factory')

describe('block', () => {
  let ipfs
  const df = factory()

  before(async () => {
    ipfs = (await df.spawn()).api
  })

  after(() => df.clean())

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
