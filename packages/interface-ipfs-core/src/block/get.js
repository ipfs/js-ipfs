/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { identity } from 'multiformats/hashes/identity'
import { CID } from 'multiformats/cid'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import testTimeout from '../utils/test-timeout.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testGet (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.get', () => {
    const data = uint8ArrayFromString('blorb')
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    /** @type {CID} */
    let cid

    before(async () => {
      ipfs = (await factory.spawn()).api
      cid = await ipfs.block.put(data)
    })

    after(() => factory.clean())

    it('should respect timeout option when getting a block', () => {
      return testTimeout(() => ipfs.block.get(CID.parse('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rA3'), {
        timeout: 1
      }))
    })

    it('should get by CID', async () => {
      const block = await ipfs.block.get(cid)

      expect(block).to.equalBytes(uint8ArrayFromString('blorb'))
    })

    it('should get an empty block', async () => {
      const cid = await ipfs.block.put(new Uint8Array(0), {
        format: 'dag-pb',
        mhtype: 'sha2-256',
        version: 0
      })

      const block = await ipfs.block.get(cid)
      expect(block).to.equalBytes(new Uint8Array(0))
    })

    it('should get a block added as CIDv0 with a CIDv1', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const cidv0 = await ipfs.block.put(input)
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const block = await ipfs.block.get(cidv1)
      expect(block).to.equalBytes(input)
    })

    it('should get a block added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const cidv1 = await ipfs.block.put(input, {
        version: 1,
        format: 'dag-pb'
      })
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const block = await ipfs.block.get(cidv0)
      expect(block).to.equalBytes(input)
    })

    it('should get a block with an identity CID, without putting first', async () => {
      const identityData = uint8ArrayFromString('A16461736466190144', 'base16upper')
      const identityHash = await identity.digest(identityData)
      const identityCID = CID.createV1(identity.code, identityHash)
      const block = await ipfs.block.get(identityCID)
      expect(block).to.equalBytes(identityData)
    })

    it('should return an error for an invalid CID', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.block.get('Non-base58 character')).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}
