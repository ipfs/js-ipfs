/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const UnixFs = require('ipfs-unixfs')
const crypto = require('crypto')
const { asDAGLink } = require('./utils')
const all = require('it-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.get', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should get object by multihash', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const node1Cid = await ipfs.object.put(obj)
      const node1 = await ipfs.object.get(node1Cid)
      let node2 = await ipfs.object.get(node1Cid)

      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node2.Data === 'string') {
        node2 = new DAGNode(Buffer.from(node2.Data), node2.Links, node2.size)
      }

      expect(node1.Data).to.eql(node2.Data)
      expect(node1.Links).to.eql(node2.Links)
    })

    it('should get object by multihash string', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const node1Cid = await ipfs.object.put(obj)
      const node1 = await ipfs.object.get(node1Cid)
      let node2 = await ipfs.object.get(node1Cid.toBaseEncodedString())

      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node2.Data === 'string') {
        node2 = new DAGNode(Buffer.from(node2.Data), node2.Links, node2.size)
      }

      expect(node1.Data).to.deep.equal(node2.Data)
      expect(node1.Links).to.deep.equal(node2.Links)
    })

    it('should get object with links by multihash string', async () => {
      const node1a = new DAGNode(Buffer.from('Some data 1'))
      const node2 = new DAGNode(Buffer.from('Some data 2'))

      const link = await asDAGLink(node2, 'some-link')
      const node1b = new DAGNode(node1a.Data, node1a.Links.concat(link))

      const node1bCid = await ipfs.object.put(node1b)
      let node1c = await ipfs.object.get(node1bCid)

      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node1c.Data === 'string') {
        node1c = new DAGNode(Buffer.from(node1c.Data), node1c.Links, node1c.size)
      }

      expect(node1a.Data).to.eql(node1c.Data)
    })

    it('should get object by base58 encoded multihash', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const node1aCid = await ipfs.object.put(obj)
      const node1a = await ipfs.object.get(node1aCid)
      let node1b = await ipfs.object.get(node1aCid, { enc: 'base58' })

      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node1b.Data === 'string') {
        node1b = new DAGNode(Buffer.from(node1b.Data), node1b.Links, node1b.size)
      }

      expect(node1a.Data).to.eql(node1b.Data)
      expect(node1a.Links).to.eql(node1b.Links)
    })

    it('should get object by base58 encoded multihash string', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const node1aCid = await ipfs.object.put(obj)
      const node1a = await ipfs.object.get(node1aCid)
      let node1b = await ipfs.object.get(node1aCid.toBaseEncodedString(), { enc: 'base58' })

      // because js-ipfs-api can't infer if the
      // returned Data is Buffer or String
      if (typeof node1b.Data === 'string') {
        node1b = new DAGNode(Buffer.from(node1b.Data), node1b.Links, node1b.size)
      }

      expect(node1a.Data).to.eql(node1b.Data)
      expect(node1a.Links).to.eql(node1b.Links)
    })

    it('should supply unaltered data', async () => {
      // has to be big enough to span several DAGNodes
      const data = crypto.randomBytes(1024 * 3000)

      const result = await all(ipfs.add({
        path: '',
        content: data
      }))

      const node = await ipfs.object.get(result[0].cid)
      const meta = UnixFs.unmarshal(node.Data)

      expect(meta.fileSize()).to.equal(data.length)
    })

    it('should error for request without argument', () => {
      return expect(ipfs.object.get(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })

    it('returns error for request with invalid argument', () => {
      return expect(ipfs.object.get('invalid', { enc: 'base58' })).to.eventually.be.rejected.and.be.an.instanceOf(Error)
    })
  })
}
