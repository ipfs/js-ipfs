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

  describe('.key.gen', () => {
    const keyTypes = [
      { type: 'rsa', size: 2048 }
    ]

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when generating a key', () => {
      return testTimeout(() => ipfs.key.gen(nanoid(), {
        type: 'rsa',
        size: 2048,
        timeout: 1
      }))
    })

    keyTypes.forEach((kt) => {
      it(`should generate a new ${kt.type} key`, async function () {
        this.timeout(20 * 1000)
        const name = nanoid()
        const key = await ipfs.key.gen(name, kt)
        expect(key).to.exist()
        expect(key).to.have.property('name', name)
        expect(key).to.have.property('id')
      })
    })
  })
}
