/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

describe('dag', function () {
  this.timeout(10 * 1000)
  let ipfsd, ipfs

  before(async () => {
    const factory = IPFSFactory.create({ type: 'proc' })

    ipfsd = await factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 },
      config: { Bootstrap: [] },
      preload: { enabled: false }
    })
    ipfs = ipfsd.api
  })

  after(() => {
    if (ipfsd) {
      return ipfsd.stop()
    }
  })

  describe('get', () => {
    it('should callback with error for invalid string CID input', (done) => {
      ipfs.dag.get('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })

    it('should callback with error for invalid buffer CID input', (done) => {
      ipfs.dag.get(Buffer.from('INVALID CID'), (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })
  })

  describe('tree', () => {
    it('should callback with error for invalid CID input', (done) => {
      ipfs.dag.tree('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })
  })
})
