/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const keys = require('libp2p-crypto/src/keys')
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

      const key = await keys.generateKeyPair('ed25519')
      const exported = key.export(password)

      await testTimeout(() => ipfs.key.import('derp', exported, password, {
        timeout: 1
      }))
    })

    it('should import an exported key', async () => {
      const password = nanoid()

      const key = await keys.generateKeyPair('ed25519')
      const exported = await key.export(password)

      const importedKey = await ipfs.key.import('clone', exported, password)
      expect(importedKey).to.exist()
      expect(importedKey).to.have.property('name', 'clone')
      expect(importedKey).to.have.property('id')
    })
  })
}
