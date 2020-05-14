/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.import', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when importing a key', async () => {
      const password = nanoid()

      const pem = await ipfs.key.export('self', password)
      expect(pem).to.exist()

      await testTimeout(() => ipfs.key.import('derp', pem, password, {
        timeout: 1
      }))
    })

    it('should import an exported key', async () => {
      const password = nanoid()

      const pem = await ipfs.key.export('self', password)
      expect(pem).to.exist()

      const key = await ipfs.key.import('clone', pem, password)
      expect(key).to.exist()
      expect(key).to.have.property('name', 'clone')
      expect(key).to.have.property('id')
    })
  })
}
