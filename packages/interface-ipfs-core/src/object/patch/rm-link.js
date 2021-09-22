/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as dagPB from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testRmLink (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.rmLink', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should remove a link from an existing node', async () => {
      const obj1 = {
        Data: uint8ArrayFromString('patch test object 1'),
        Links: []
      }

      const obj2 = {
        Data: uint8ArrayFromString('patch test object 2'),
        Links: []
      }

      const nodeCid = await ipfs.object.put(obj1)
      const childCid = await ipfs.object.put(obj2)
      const child = await ipfs.object.get(childCid)
      const childBuf = dagPB.encode(child)
      const childAsDAGLink = {
        Name: 'my-link',
        Tsize: childBuf.length,
        Hash: CID.createV0(await sha256.digest(childBuf))
      }
      const parentCid = await ipfs.object.patch.addLink(nodeCid, childAsDAGLink)
      const withoutChildCid = await ipfs.object.patch.rmLink(parentCid, childAsDAGLink)

      expect(withoutChildCid).to.not.deep.equal(parentCid)
      expect(withoutChildCid).to.deep.equal(nodeCid)

      /* TODO: revisit this assertions.
      const node = await ipfs.object.patch.rmLink(testNodeWithLinkMultihash, testLinkPlainObject)
      expect(node.multihash).to.not.deep.equal(testNodeWithLinkMultihash)
      */
    })

    it('returns error for request without arguments', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.rmLink(null, null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('returns error for request only one invalid argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.rmLink('invalid', null)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid first argument', () => {
      const root = ''
      const link = 'foo'

      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.rmLink(root, link)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })
  })
}
