/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pin.add', function () {
    this.timeout(50 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
      await Promise.all(fixtures.files.map(file => {
        return ipfs.add(file.data, { pin: false })
      }))
    })

    after(() => common.teardown())

    it('should add a pin', async () => {
      const pinset = await ipfs.pin.add(fixtures.files[0].cid, { recursive: false })
      expect(pinset).to.deep.include({
        hash: fixtures.files[0].cid
      })
    })
  })
}
