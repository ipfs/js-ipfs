/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { nanoid } = require('nanoid')
const { Buffer } = require('buffer')
const factory = require('../utils/factory')

describe('object', function () {
  this.timeout(10 * 1000)
  const df = factory()
  let ipfsd, ipfs

  before(async function () {
    ipfsd = await df.spawn()
    ipfs = ipfsd.api
  })

  after(() => df.clean())

  describe('get', () => {
    it('should callback with error for invalid CID input', () => {
      return expect(ipfs.object.get('INVALID CID'))
        .to.eventually.be.rejected()
        .and.to.have.property('code').that.equals('ERR_INVALID_CID')
    })

    it('should not error when passed null options', async () => {
      const cid = await ipfs.object.put(Buffer.from(nanoid()))
      await ipfs.object.get(cid)
    })
  })

  describe('put', () => {
    it('should not error when passed null options', () => {
      return ipfs.object.put(Buffer.from(nanoid()), null)
    })
  })

  describe('patch.addLink', () => {
    it('should not error when passed null options', async () => {
      const aCid = await ipfs.object.put(Buffer.from(nanoid()))
      const bCid = await ipfs.object.put(Buffer.from(nanoid()))
      const bNode = await ipfs.object.get(bCid)

      const link = {
        name: 'link-name',
        cid: bCid,
        size: bNode.size
      }

      await ipfs.object.patch.addLink(aCid, link, null)
    })
  })

  describe('patch.rmLink', () => {
    it('should not error when passed null options', async () => {
      const aCid = await ipfs.object.put(Buffer.from(nanoid()))
      const bCid = await ipfs.object.put(Buffer.from(nanoid()))
      const bNode = await ipfs.object.get(bCid)

      const cCid = await ipfs.object.patch.addLink(aCid, {
        Name: 'nodeBLink',
        Hash: bCid,
        Tsize: bNode.size
      })
      const cNode = await ipfs.object.get(cCid)

      await ipfs.object.patch.rmLink(cCid, cNode.Links[0], null)
    })
  })

  describe('patch.appendData', () => {
    it('should not error when passed null options', async () => {
      const cid = await ipfs.object.put(Buffer.from(nanoid()), null)
      await ipfs.object.patch.appendData(cid, Buffer.from(nanoid()), null)
    })
  })

  describe('patch.setData', () => {
    it('should not error when passed null options', async () => {
      const cid = await ipfs.object.put(Buffer.from(nanoid()), null)
      await ipfs.object.patch.setData(cid, Buffer.from(nanoid()), null)
    })
  })
})
