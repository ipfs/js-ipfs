/* eslint-env mocha */
'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { asDAGLink } = require('./utils')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.object.put', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should put an object', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const cid = await ipfs.object.put(obj)
      const node = await ipfs.object.get(cid)

      const nodeJSON = node.toJSON()
      expect(obj.Data).to.deep.equal(nodeJSON.data)
      expect(obj.Links).to.deep.equal(nodeJSON.links)
    })

    it('should put a JSON encoded Buffer', async () => {
      const obj = {
        Data: Buffer.from(hat()),
        Links: []
      }

      const obj2 = {
        Data: obj.Data.toString(),
        Links: obj.Links
      }

      const buf = Buffer.from(JSON.stringify(obj2))

      const cid = await ipfs.object.put(buf, { enc: 'json' })

      const node = await ipfs.object.get(cid)
      const nodeJSON = node.toJSON()
      expect(nodeJSON.data).to.eql(node.Data)
    })

    it('should put a Protobuf encoded Buffer', async () => {
      const node = new DAGNode(Buffer.from(hat()))
      const serialized = node.serialize()

      const cid = await ipfs.object.put(serialized, { enc: 'protobuf' })
      const node2 = await ipfs.object.get(cid)
      expect(node2.Data).to.deep.equal(node.Data)
      expect(node2.Links).to.deep.equal(node.Links)
    })

    it('should put a Buffer as data', async () => {
      const data = Buffer.from(hat())

      const cid = await ipfs.object.put(data)
      const node = await ipfs.object.get(cid)
      const nodeJSON = node.toJSON()
      expect(data).to.deep.equal(nodeJSON.data)
      expect([]).to.deep.equal(nodeJSON.links)
    })

    it('should put a Protobuf DAGNode', async () => {
      const dNode = new DAGNode(Buffer.from(hat()))

      const cid = await ipfs.object.put(dNode)
      const node = await ipfs.object.get(cid)
      expect(dNode.Data).to.deep.equal(node.Data)
      expect(dNode.Links).to.deep.equal(node.Links)
    })

    it('should fail if a string is passed', () => {
      return expect(ipfs.object.put(hat())).to.eventually.be.rejected()
    })

    it('should put a Protobuf DAGNode with a link', async () => {
      const node1a = new DAGNode(Buffer.from(hat()))
      const node2 = new DAGNode(Buffer.from(hat()))

      const link = await asDAGLink(node2, 'some-link')

      const node1b = new DAGNode(node1a.Data, node1a.Links.concat(link))

      const cid = await ipfs.object.put(node1b)
      const node = await ipfs.object.get(cid)
      expect(node1b.Data).to.deep.equal(node.Data)
      expect(node1b.Links).to.deep.equal(node.Links)
    })
  })
}
