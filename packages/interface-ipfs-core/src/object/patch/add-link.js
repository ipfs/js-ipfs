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
export function testAddLink (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.addLink', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should add a link to an existing node', async () => {
      const obj = {
        Data: uint8ArrayFromString('patch test object'),
        Links: []
      }
      // link to add
      const node2 = {
        Data: uint8ArrayFromString('some other node'),
        Links: []
      }
      // note: we need to put the linked obj, otherwise IPFS won't
      // timeout. Reason: it needs the node to get its size
      await ipfs.object.put(node2)
      const node2Buf = dagPB.encode(node2)
      const link = {
        Name: 'link-to-node',
        Tsize: node2Buf.length,
        Hash: CID.createV0(await sha256.digest(node2Buf))
      }

      // manual create dag step by step
      const node1a = {
        Data: obj.Data,
        Links: obj.Links
      }
      const node1b = {
        Data: node1a.Data,
        Links: [link]
      }
      const node1bCid = await ipfs.object.put(node1b)

      // add link with patch.addLink
      const testNodeCid = await ipfs.object.put(obj)
      const cid = await ipfs.object.patch.addLink(testNodeCid, link)

      // assert both are equal
      expect(node1bCid).to.eql(cid)

      /* TODO: revisit this assertions.
      // note: make sure we can link js plain objects
      const content = uint8ArrayFromString(JSON.stringify({
        title: 'serialized object'
      }, null, 0))
      const result = await ipfs.add(content)
      expect(result).to.exist()
      expect(result).to.have.lengthOf(1)
      const object = result.pop()
      const node3 = {
        name: object.hash,
        multihash: object.hash,
        size: object.size
      }
      const node = await ipfs.object.patch.addLink(testNodeWithLinkMultihash, node3)
      expect(node).to.exist()
      testNodeWithLinkMultihash = node.multihash
      testLinkPlainObject = node3
      */
    })

    it('returns error for request without arguments', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.addLink(null, null, null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with only one invalid argument', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.object.patch.addLink('invalid', null, null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
