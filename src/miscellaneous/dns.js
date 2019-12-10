/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dns', function () {
    this.timeout(10 * 1000)
    this.retries(3)
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should non-recursively resolve ipfs.io', async () => {
      const res = await ipfs.dns('ipfs.io', { recursive: false })

      // matches pattern /ipns/<ipnsaddress>
      expect(res).to.match(/\/ipns\/.+$/)
    })

    it('should recursively resolve ipfs.io', async () => {
      const res = await ipfs.dns('ipfs.io', { recursive: true })

      // matches pattern /ipfs/<hash>
      expect(res).to.match(/\/ipfs\/.+$/)
    })

    it('should resolve subdomain docs.ipfs.io', async () => {
      const res = await ipfs.dns('docs.ipfs.io')

      // matches pattern /ipfs/<hash>
      expect(res).to.match(/\/ipfs\/.+$/)
    })
  })
}
