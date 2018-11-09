/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

describe('pin', () => {
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

  describe('ls', () => {
    it('should callback with error for invalid non-string pin type option', (done) => {
      ipfs.pin.ls({ type: 6 }, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_PIN_TYPE')
        done()
      })
    })

    it('should callback with error for invalid string pin type option', (done) => {
      ipfs.pin.ls({ type: '__proto__' }, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_PIN_TYPE')
        done()
      })
    })
  })
})
