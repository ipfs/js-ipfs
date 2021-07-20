/* eslint-env mocha */
'use strict'

const all = require('it-all')
const { CID } = require('multiformats/cid')
const { sha256 } = require('multiformats/hashes/sha2')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { CarWriter } = require('@ipld/car')
const raw = require('multiformats/codecs/raw')
const uint8ArrayFromString = require('uint8arrays/from-string')

/**
 *
 * @param {number} num
 */
async function createBlocks (num) {
  const blocks = []

  for (let i = 0; i < num; i++) {
    const bytes = uint8ArrayFromString('block-' + Math.random())
    const digest = await sha256.digest(raw.encode(bytes))
    const cid = CID.create(1, raw.code, digest)

    blocks.push({ bytes, cid })
  }

  return blocks
}

/**
 * @param {{ cid: CID, bytes: Uint8Array }[]} blocks
 * @returns {AsyncIterable<Uint8Array>}
 */
async function createCar (blocks) {
  const rootBlock = blocks[0]
  const { writer, out } = await CarWriter.create([rootBlock.cid])

  writer.put(rootBlock)
    .then(async () => {
      for (const block of blocks.slice(1)) {
        writer.put(block)
      }

      await writer.close()
    })

  return out
}

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag.import', () => {
    let ipfs
    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should import a car file', async () => {
      const blocks = await createBlocks(5)
      const car = await createCar(blocks)

      const result = await all(ipfs.dag.import(car))
      expect(result).to.have.lengthOf(1)
      expect(result).to.have.nested.deep.property('[0].root.cid', blocks[0].cid)

      for (const { cid } of blocks) {
        await expect(ipfs.block.get(cid)).to.eventually.be.ok()
      }
    })

    it('should import multiple car files', async () => {
      const blocks1 = await createBlocks(5)
      const car1 = await createCar(blocks1)

      const blocks2 = await createBlocks(5)
      const car2 = await createCar(blocks2)

      const result = await all(ipfs.dag.import([car1, car2]))
      expect(result).to.have.nested.deep.property('[0].root.cid', blocks1[0].cid)
      expect(result).to.have.nested.deep.property('[1].root.cid', blocks2[0].cid)

      for (const { cid } of blocks1) {
        await expect(ipfs.block.get(cid)).to.eventually.be.ok()
      }

      for (const { cid } of blocks2) {
        await expect(ipfs.block.get(cid)).to.eventually.be.ok()
      }
    })
  })
}
