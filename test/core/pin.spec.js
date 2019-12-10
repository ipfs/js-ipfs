/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const factory = require('../utils/factory')

describe('pin', function () {
  this.timeout(10 * 1000)
  const df = factory()
  let ipfsd, ipfs

  before(async () => {
    ipfsd = await df.spawn()
    ipfs = ipfsd.api
  })

  after(() => {
    if (ipfsd) {
      return ipfsd.stop()
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
