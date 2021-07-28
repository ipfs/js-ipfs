/* eslint-env mocha */
'use strict'

const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')
const dagCbor = require('@ipld/dag-cbor')
const { CID } = require('multiformats/cid')
const { sha256, sha512 } = require('multiformats/hashes/sha2')
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

  describe('.dag.put', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    const pbNode = {
      Data: uint8ArrayFromString('some data'),
      Links: []
    }
    const cborNode = {
      data: uint8ArrayFromString('some other data')
    }

    it('should put dag-pb with default hash func (sha2-256)', () => {
      return ipfs.dag.put(pbNode, {
        format: 'dag-pb',
        hashAlg: 'sha2-256'
      })
    })

    it('should put dag-pb with non-default hash func (sha2-512)', () => {
      return ipfs.dag.put(pbNode, {
        format: 'dag-pb',
        hashAlg: 'sha2-512'
      })
    })

    it('should put dag-cbor with default hash func (sha2-256)', () => {
      return ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })
    })

    it('should put dag-cbor with non-default hash func (sha2-512)', () => {
      return ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha2-512'
      })
    })

    it('should return the cid', async () => {
      const cid = await ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      })
      expect(cid).to.exist()
      expect(cid).to.be.an.instanceOf(CID)

      const bytes = dagCbor.encode(cborNode)
      const hash = await sha256.digest(bytes)
      const _cid = CID.createV1(dagCbor.code, hash)

      expect(cid.bytes).to.eql(_cid.bytes)
    })

    it('should not fail when calling put without options', () => {
      return ipfs.dag.put(cborNode)
    })

    it('should set defaults when calling put without options', async () => {
      const cid = await ipfs.dag.put(cborNode)
      expect(cid.code).to.equal(dagCbor.code)
      expect(cid.multihash.code).to.equal(sha256.code)
    })

    it('should override hash algorithm default and resolve with it', async () => {
      const cid = await ipfs.dag.put(cborNode, {
        format: 'dag-cbor',
        hashAlg: 'sha2-512'
      })
      expect(cid.code).to.equal(dagCbor.code)
      expect(cid.multihash.code).to.equal(sha512.code)
    })

    it.skip('should put by passing the cid instead of format and hashAlg', (done) => {})
  })
}
