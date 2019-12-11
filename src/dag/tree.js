/* eslint-env mocha */
'use strict'

const pEachSeries = require('p-each-series')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-cbor')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag.tree', () => {
    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    let nodePb
    let nodeCbor
    let cidPb
    let cidCbor

    before(async function () {
      nodePb = new DAGNode(Buffer.from('I am inside a Protobuf'))
      cidPb = await dagPB.util.cid(nodePb.serialize())

      nodeCbor = {
        someData: 'I am inside a Cbor object',
        pb: cidPb
      }
      cidCbor = await dagCBOR.util.cid(dagCBOR.util.serialize(nodeCbor))

      await pEachSeries([
        { node: nodePb, multicodec: 'dag-pb', hashAlg: 'sha2-256' },
        { node: nodeCbor, multicodec: 'dag-cbor', hashAlg: 'sha2-256' }
      ], (el) => ipfs.dag.put(el.node, {
        format: el.multicodec,
        hashAlg: el.hashAlg
      }))
    })

    it('should get tree with CID', async () => {
      const paths = await ipfs.dag.tree(cidCbor)
      expect(paths).to.eql([
        'pb',
        'someData'
      ])
    })

    it('should get tree with CID and path', async () => {
      const paths = await ipfs.dag.tree(cidCbor, 'someData')
      expect(paths).to.eql([])
    })

    it('should get tree with CID and path as String', async () => {
      const cidCborStr = cidCbor.toBaseEncodedString()

      const paths = await ipfs.dag.tree(cidCborStr + '/someData')
      expect(paths).to.eql([])
    })

    it('should get tree with CID recursive (accross different formats)', async () => {
      const paths = await ipfs.dag.tree(cidCbor, { recursive: true })
      expect(paths).to.have.members([
        'pb',
        'someData',
        'pb/Links',
        'pb/Data'
      ])
    })

    it('should get tree with CID and path recursive', async () => {
      const paths = await ipfs.dag.tree(cidCbor, 'pb', { recursive: true })
      expect(paths).to.have.members([
        'Links',
        'Data'
      ])
    })
  })
}
