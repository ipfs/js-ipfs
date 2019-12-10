/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.object.patch.appendData', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should append data to an existing node', async () => {
      const obj = {
        Data: Buffer.from('patch test object'),
        Links: []
      }

      const nodeCid = await ipfs.object.put(obj)
      const patchedNodeCid = await ipfs.object.patch.appendData(nodeCid, Buffer.from('append'))
      expect(patchedNodeCid).to.not.deep.equal(nodeCid)
    })

    it('returns error for request without key & data', () => {
      return expect(ipfs.object.patch.appendData(null, null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request without data', () => {
      const filePath = 'test/fixtures/test-data/badnode.json'

      return expect(ipfs.object.patch.appendData(null, filePath)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
