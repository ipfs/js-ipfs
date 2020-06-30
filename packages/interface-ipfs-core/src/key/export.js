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

  describe('.key.export', () => {
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when exporting a key', () => {
      return testTimeout(() => ipfs.key.export('self', nanoid(), {
        timeout: 1
      }))
    })

    it('should export "self" key', async function () {
      const pem = await ipfs.key.export('self', nanoid())
      expect(pem).to.exist()
    })
  })
}
