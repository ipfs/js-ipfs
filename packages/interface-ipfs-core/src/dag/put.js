/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as dagCBOR from '@ipld/dag-cbor'
import { CID } from 'multiformats/cid'
import { sha256, sha512 } from 'multiformats/hashes/sha2'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testPut (factory, options) {
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
    const joseNode = 'eyJhbGciOiJFUzI1NksifQ.AXESICjDGMg3fEBSX7_fpbBUYF4E61TXLysmLJgfGEpFG8Pu.z7a2MvPWLsd7leOeHyfeA1OcAFC9yy5rn1HD8xCeHz3nFrwyn_Su5xXUoaIxAre3fXhGjPkVSNiCE36AKiaMng'

    it('should put dag-pb with default hash func (sha2-256)', () => {
      return ipfs.dag.put(pbNode, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })
    })

    it('should put dag-pb with non-default hash func (sha2-512)', () => {
      return ipfs.dag.put(pbNode, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-512'
      })
    })

    it('should put dag-cbor with default hash func (sha2-256)', () => {
      return ipfs.dag.put(cborNode, {
        storeCodec: 'dag-cbor',
        hashAlg: 'sha2-256'
      })
    })

    it('should put dag-cbor with non-default hash func (sha2-512)', () => {
      return ipfs.dag.put(cborNode, {
        storeCodec: 'dag-cbor',
        hashAlg: 'sha2-512'
      })
    })

    it('should put dag-jose with default hash func (sha2-256)', () => {
      return ipfs.dag.put(joseNode, {
        storeCodec: 'dag-jose',
        hashAlg: 'sha2-256'
      })
    })

    it('should put dag-jose with non-default hash func (sha2-512)', () => {
      return ipfs.dag.put(joseNode, {
        storeCodec: 'dag-jose',
        hashAlg: 'sha2-512'
      })
    })

    it('should return the cid', async () => {
      const cid = await ipfs.dag.put(cborNode, {
        storeCodec: 'dag-cbor',
        hashAlg: 'sha2-256'
      })
      expect(cid).to.exist()
      expect(cid).to.be.an.instanceOf(CID)

      const bytes = dagCBOR.encode(cborNode)
      const hash = await sha256.digest(bytes)
      const _cid = CID.createV1(dagCBOR.code, hash)

      expect(cid.bytes).to.eql(_cid.bytes)
    })

    it('should not fail when calling put without options', () => {
      return ipfs.dag.put(cborNode)
    })

    it('should set defaults when calling put without options', async () => {
      const cid = await ipfs.dag.put(cborNode)
      expect(cid.code).to.equal(dagCBOR.code)
      expect(cid.multihash.code).to.equal(sha256.code)
    })

    it('should override hash algorithm default and resolve with it', async () => {
      const cid = await ipfs.dag.put(cborNode, {
        storeCodec: 'dag-cbor',
        hashAlg: 'sha2-512'
      })
      expect(cid.code).to.equal(dagCBOR.code)
      expect(cid.multihash.code).to.equal(sha512.code)
    })

    it.skip('should put by passing the cid instead of format and hashAlg', (done) => {})
  })
}
