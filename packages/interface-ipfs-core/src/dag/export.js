/* eslint-env mocha */
'use strict'

const all = require('it-all')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { CarReader } = require('@ipld/car')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const loadFixture = require('aegir/utils/fixtures')
const toBuffer = require('it-to-buffer')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag.export', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should export a car file', async () => {
      const child = dagPb.encode({
        Data: uint8ArrayFromString('block-' + Math.random()),
        Links: []
      })
      const childCid = await ipfs.block.put(child, {
        format: 'dag-pb',
        version: 0
      })
      const parent = dagPb.encode({
        Links: [{
          Hash: childCid,
          Tsize: child.length,
          Name: ''
        }]
      })
      const parentCid = await ipfs.block.put(parent, {
        format: 'dag-pb',
        version: 0
      })
      const grandParent = dagCbor.encode({
        parent: parentCid
      })
      const grandParentCid = await await ipfs.block.put(grandParent, {
        format: 'dag-cbor',
        version: 1
      })

      const expectedCids = [
        grandParentCid,
        parentCid,
        childCid
      ]

      const reader = await CarReader.fromIterable(ipfs.dag.export(grandParentCid))
      const cids = await all(reader.cids())

      expect(cids).to.deep.equal(expectedCids)
    })

    it('export of shuffled devnet export identical to canonical original', async function () {
      // @ts-ignore this is mocha
      this.timeout(360000)

      const input = loadFixture('test/fixtures/car/lotus_devnet_genesis.car', 'interface-ipfs-core')
      const result = await all(ipfs.dag.import(async function * () { yield input }()))
      const exported = await toBuffer(ipfs.dag.export(result[0].root.cid))

      expect(exported).to.equalBytes(input)
    })

    it('export of shuffled testnet export identical to canonical original', async function () {
      // @ts-ignore this is mocha
      this.timeout(360000)

      const input = loadFixture('test/fixtures/car/lotus_testnet_export_128.car', 'interface-ipfs-core')
      const result = await all(ipfs.dag.import(async function * () { yield input }()))
      const exported = await toBuffer(ipfs.dag.export(result[0].root.cid))

      expect(exported).to.equalBytes(input)
    })
  })
}
