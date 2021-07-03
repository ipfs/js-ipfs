/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const dagPB = require('@ipld/dag-pb')
const { nanoid } = require('nanoid')
const { CID } = require('multiformats/cid')
const sha256 = require('multiformats/hashes/sha2')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.links', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get empty links by multihash', async () => {
      const testObj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const node = await ipfs.object.get(cid)
      const links = await ipfs.object.links(cid)

      expect(node.Links).to.eql(links)
    })

    it('should get links by multihash', async () => {
      const node1a = {
        Data: uint8ArrayFromString('Some data 1'),
        Links: []
      }
      const node2 = {
        Data: uint8ArrayFromString('Some data 2'),
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

      const links = await ipfs.object.links(node1bCid)

      expect(links).to.have.lengthOf(1)
      expect(node1b.Links).to.deep.equal(links)
    })

    it('should get links by base58 encoded multihash', async () => {
      const testObj = {
        Data: uint8ArrayFromString(nanoid()),
        Links: []
      }

      const cid = await ipfs.object.put(testObj)
      const node = await ipfs.object.get(cid)

      const links = await ipfs.object.links(cid.bytes, { enc: 'base58' })
      expect(node.Links).to.deep.equal(links)
    })

    it('should get links from CBOR object', async () => {
      const hashes = []

      const res1 = await ipfs.add(uint8ArrayFromString('test data'))
      hashes.push(res1.cid)

      const res2 = await ipfs.add(uint8ArrayFromString('more test data'))
      hashes.push(res2.cid)

      const obj = {
        some: 'data',
        mylink: hashes[0],
        myobj: {
          anotherLink: hashes[1]
        }
      }
      const cid = await ipfs.dag.put(obj)

      const links = await ipfs.object.links(cid)
      expect(links.length).to.eql(2)

      // TODO: js-ipfs succeeds but go returns empty strings for link name
      // const names = [links[0].name, links[1].name]
      // expect(names).includes('mylink')
      // expect(names).includes('myobj/anotherLink')

      const cids = [links[0].Hash.toString(), links[1].Hash.toString()]
      expect(cids).includes(hashes[0].toString())
      expect(cids).includes(hashes[1].toString())
    })

    it('returns error for request without argument', () => {
      return expect(ipfs.object.links(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      return expect(ipfs.object.links('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
