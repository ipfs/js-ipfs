/* eslint-env mocha */
'use strict'

describe.skip('swarm', function () {
  this.timeout(10 * 1000)
  let df
  let ipfsd, ipfs

  before(async () => {
    df = factory()
    ipfsd = await df.spawn()
    ipfs = ipfsd.api
  })

  after(() => df.clean())

  describe('peers', () => {
    it('should not error when passed null options', async () => {
      await ipfs.swarm.peers(null)
    })
  })
})
