/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.new', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should create a new object with no template', async () => {
      const cid = await ipfs.object.new()
      expect(cid.toBaseEncodedString()).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')
    })

    it('should create a new object with unixfs-dir template', async () => {
      const cid = await ipfs.object.new('unixfs-dir')
      expect(cid.toBaseEncodedString()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })
  })
}
