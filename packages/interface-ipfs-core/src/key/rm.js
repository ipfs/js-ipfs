/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.rm', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should rm a key', async function () {
      // @ts-ignore this is mocha
      this.timeout(30 * 1000)

      const key = await ipfs.key.gen(nanoid(), { type: 'rsa', size: 2048 })

      const removeRes = await ipfs.key.rm(key.name)
      expect(removeRes).to.exist()
      expect(removeRes).to.have.property('name', key.name)
      expect(removeRes).to.have.property('id', key.id)

      const res = await ipfs.key.list()
      expect(res.find(k => k.name === key.name)).to.not.exist()
    })
  })
}
