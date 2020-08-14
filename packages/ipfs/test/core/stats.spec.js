/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const all = require('it-all')
const factory = require('../utils/factory')

describe('stats', function () {
  const df = factory()
  this.timeout(10 * 1000)
  let ipfsd, ipfs

  before(async () => {
    ipfsd = await df.spawn()
    ipfs = ipfsd.api
  })

  after(() => df.clean())

  describe('bw', () => {
    it('should throw error for invalid interval option', async () => {
      await expect(all(ipfs.stats.bw({ poll: true, interval: 'INVALID INTERVAL' })))
        .to.eventually.be.rejected()
        .and.to.have.property('code').that.equals('ERR_INVALID_POLL_INTERVAL')
    })

    it('should not error when passed null options', async () => {
      await all(ipfs.stats.bw(null))
    })
  })
})
