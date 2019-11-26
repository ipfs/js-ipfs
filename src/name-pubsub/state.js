/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.pubsub.state', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get the current state of pubsub', async function () {
      this.timeout(50 * 1000)

      const res = await ipfs.name.pubsub.state()
      expect(res).to.exist()
      expect(res).to.have.property('enabled')
      expect(res.enabled).to.be.eql(true)
    })
  })
}
