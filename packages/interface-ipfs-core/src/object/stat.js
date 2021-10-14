/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as dagPB from '@ipld/dag-pb'
import { nanoid } from 'nanoid'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testStat (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.stat', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should get stats by multihash', async () => {
      const testObj = {
        Data: uint8ArrayFromString('get test object'),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const stats = await ipfs.object.stat(cid)
      const expected = {
        Hash: CID.parse('QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ').toV1(),
        NumLinks: 0,
        BlockSize: 17,
        LinksSize: 2,
        DataSize: 15,
        CumulativeSize: 17
      }

      expect(stats).to.deep.equal(expected)
    })

    it('should get stats for object with links by multihash', async () => {
      const node1a = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }
      const node2 = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }
      const node2Buf = dagPB.encode(node2)
      const link = {
        Name: 'some-link',
        Tsize: node2Buf.length,
        Hash: CID.createV0(await sha256.digest(node2Buf))
      }
      const node1b = {
        Data: node1a.Data,
        Links: [link]
      }
      const node1bCid = await ipfs.object.put(node1b)

      const stats = await ipfs.object.stat(node1bCid)
      const expected = {
        Hash: node1bCid,
        NumLinks: 1,
        BlockSize: 74,
        LinksSize: 53,
        DataSize: 21,
        CumulativeSize: 97
      }
      expect(stats).to.deep.equal(expected)
    })

    it('returns error for request without argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.stat(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.stat('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
