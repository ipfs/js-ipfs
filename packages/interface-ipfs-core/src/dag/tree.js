/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const dagCBOR = require('ipld-dag-cbor')
const all = require('it-all')
const drain = require('it-drain')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const CID = require('cids')
const testTimeout = require('../utils/test-timeout')

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
      nodePb = new DAGNode(uint8ArrayFromString('I am inside a Protobuf'))
      cidPb = await dagPB.util.cid(nodePb.serialize())

      nodeCbor = {
        someData: 'I am inside a Cbor object',
        pb: cidPb
      }
      cidCbor = await dagCBOR.util.cid(dagCBOR.util.serialize(nodeCbor))

      await ipfs.dag.put(nodePb, { format: 'dag-pb', hashAlg: 'sha2-256' })
      await ipfs.dag.put(nodeCbor, { format: 'dag-cbor', hashAlg: 'sha2-256' })
    })

    it('should respect timeout option when resolving a DAG tree', () => {
      return testTimeout(() => drain(ipfs.dag.tree(new CID('QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rA8'), {
        timeout: 1
      })))
    })

    it('should get tree with CID', async () => {
      const paths = await all(ipfs.dag.tree(cidCbor))
      expect(paths).to.eql([
        'pb',
        'someData'
      ])
    })

    it('should get tree with CID and path', async () => {
      const paths = await all(ipfs.dag.tree(cidCbor, {
        path: 'someData'
      }))
      expect(paths).to.eql([])
    })

    it('should get tree with CID recursive (accross different formats)', async () => {
      const paths = await all(ipfs.dag.tree(cidCbor, { recursive: true }))
      expect(paths).to.have.members([
        'pb',
        'someData',
        'pb/Links',
        'pb/Data'
      ])
    })

    it('should get tree with CID and path recursive', async () => {
      const paths = await all(ipfs.dag.tree(cidCbor, {
        path: 'pb',
        recursive: true
      }))
      expect(paths).to.have.members([
        'Links',
        'Data'
      ])
    })
  })
}
