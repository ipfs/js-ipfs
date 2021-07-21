/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const dagPB = require('@ipld/dag-pb')
const { nanoid } = require('nanoid')
const { CID } = require('multiformats/cid')
const { sha256 } = require('multiformats/hashes/sha2')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.stat', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get stats by multihash', async () => {
      const testObj = {
        Data: uint8ArrayFromString('get test object'),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const stats = await ipfs.object.stat(cid)
      const expected = {
        Hash: CID.parse('QmNggDXca24S6cMPEYHZjeuc4QRmofkRrAEqVL3Ms2sdJZ'),
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
        Links: node1a.Links.concat(link)
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
      return expect(ipfs.object.stat(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      return expect(ipfs.object.stat('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
