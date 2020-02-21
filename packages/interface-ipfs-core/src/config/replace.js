/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.replace', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    const config = {
      Fruit: 'Bananas'
    }

    it('should replace the whole config', async () => {
      await ipfs.config.replace(config)

      const _config = await ipfs.config.get()
      expect(_config).to.deep.equal(config)
    })

    it('should replace to empty config', async () => {
      await ipfs.config.replace({})

      const _config = await ipfs.config.get()
      expect(_config).to.deep.equal({})
    })
  })
}
