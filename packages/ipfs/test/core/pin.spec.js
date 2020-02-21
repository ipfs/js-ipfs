/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const all = require('it-all')
const factory = require('../utils/factory')

describe('pin', function () {
  this.timeout(10 * 1000)
  const df = factory()
  let ipfsd, ipfs

  before(async () => {
    ipfsd = await df.spawn()
    ipfs = ipfsd.api
  })

  after(() => df.clean())

  describe('ls', () => {
    it('should throw error for invalid non-string pin type option', () => {
      return expect(all(ipfs.pin.ls({ type: 6 })))
        .to.eventually.be.rejected()
        .with.property('code').that.equals('ERR_INVALID_PIN_TYPE')
    })

    it('should throw error for invalid string pin type option', () => {
      return expect(all(ipfs.pin.ls({ type: '__proto__' })))
        .to.eventually.be.rejected()
        .with.property('code').that.equals('ERR_INVALID_PIN_TYPE')
    })
  })
})
