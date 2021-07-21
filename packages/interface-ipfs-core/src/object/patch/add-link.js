/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const dagPB = require('@ipld/dag-pb')
const { CID } = require('multiformats/cid')
const { sha256 } = require('multiformats/hashes/sha2')
const { getDescribe, getIt, expect } = require('../../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.patch.addLink', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

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
        Links: node1a.Links.concat(link)
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
      return expect(ipfs.object.patch.addLink(null, null, null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with only one invalid argument', () => {
      return expect(ipfs.object.patch.addLink('invalid', null, null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
