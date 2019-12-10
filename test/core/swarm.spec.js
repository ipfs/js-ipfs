/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const factory = require('../utils/factory')

describe('swarm', function () {
  const df = factory()
  this.timeout(10 * 1000)
  let ipfsd, ipfs

  before(async () => {
    ipfsd = await df.spawn()
    ipfs = ipfsd.api
  })

  after(() => df.clean())

  describe('peers', () => {
    it('should not error when passed null options', (done) => {
      ipfs.swarm.peers(null, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })
})
