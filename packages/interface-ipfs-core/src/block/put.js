/* eslint-env mocha */
'use strict'

const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const { base58btc } = require('multiformats/bases/base58')
const { CID } = require('multiformats/cid')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const raw = require('multiformats/codecs/raw')
const { sha512 } = require('multiformats/hashes/sha2')

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

  describe('.block.put', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should put a buffer, using defaults', async () => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const blob = uint8ArrayFromString('blorb')

      const cid = await ipfs.block.put(blob)

      expect(cid.toString()).to.equal(expectedHash)
      expect(cid.bytes).to.equalBytes(base58btc.decode(`z${expectedHash}`))
    })

    it('should put a buffer, using options', async () => {
      const blob = uint8ArrayFromString(`TEST${Math.random()}`)

      const cid = await ipfs.block.put(blob, {
        format: 'raw',
        mhtype: 'sha2-512',
        version: 1,
        pin: true
      })

      expect(cid.version).to.equal(1)
      expect(cid.code).to.equal(raw.code)
      expect(cid.multihash.code).to.equal(sha512.code)

      expect(await all(ipfs.pin.ls({ paths: cid }))).to.have.lengthOf(1)
    })

    it('should put a Block instance', async () => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const expectedCID = CID.parse(expectedHash)
      const b = uint8ArrayFromString('blorb')

      const cid = await ipfs.block.put(b)

      expect(cid.multihash.bytes).to.equalBytes(expectedCID.multihash.bytes)
    })
  })
}
