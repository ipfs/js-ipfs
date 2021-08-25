/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { keys } = require('libp2p-crypto')
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

  describe('.key.import', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should import an exported key', async () => {
      const password = nanoid()

      const key = await keys.generateKeyPair('Ed25519')
      const exported = await key.export(password)

      const importedKey = await ipfs.key.import('clone', exported, password)
      expect(importedKey).to.exist()
      expect(importedKey).to.have.property('name', 'clone')
      expect(importedKey).to.have.property('id')
    })
  })
}
