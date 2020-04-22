/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const pmap = require('p-map')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const Block = require('ipld-block')
const multihashing = require('multihashing-async')
const CID = require('cids')
const all = require('it-all')
const concat = require('it-concat')
const factory = require('../utils/factory')

const makeBlock = async () => {
  const d = Buffer.from(`IPFS is awesome ${nanoid()}`)
  const h = await multihashing(d, 'sha2-256')

  return new Block(d, new CID(h))
}

describe('bitswap', function () {
  this.timeout(60 * 1000)
  const df = factory()

  describe('transfer a block between', () => {
    it('2 peers', async function () {
      const remote = (await df.spawn({ type: 'js' })).api
      const proc = (await df.spawn({ type: 'proc' })).api
      await proc.swarm.connect(remote.peerId.addresses[0])
      const block = await makeBlock()

      await proc.block.put(block)
      const b = await remote.block.get(block.cid)

      expect(b.data).to.eql(block.data)
      await df.clean()
    })

    it('3 peers', async () => {
      const blocks = await Promise.all([...Array(6).keys()].map(() => makeBlock()))
      const remote1 = (await df.spawn({ type: 'js' })).api
      const remote2 = (await df.spawn({ type: 'js' })).api
      const proc = (await df.spawn({ type: 'proc' })).api
      await proc.swarm.connect(remote1.peerId.addresses[0])
      await proc.swarm.connect(remote2.peerId.addresses[0])
      await remote1.swarm.connect(remote2.peerId.addresses[0])

      await remote1.block.put(blocks[0])
      await remote1.block.put(blocks[1])
      await remote2.block.put(blocks[2])
      await remote2.block.put(blocks[3])
      await proc.block.put(blocks[4])
      await proc.block.put(blocks[5])

      await pmap(blocks, async (block) => {
        expect(await remote1.block.get(block.cid)).to.eql(block)
        expect(await remote2.block.get(block.cid)).to.eql(block)
        expect(await proc.block.get(block.cid)).to.eql(block)
      }, { concurrency: 3 })
      await df.clean()
    })
  })

  describe('transfer a file between', () => {
    it('2 peers', async () => {
      // TODO make this test more interesting (10Mb file)
      // TODO remove randomness from the test
      const file = Buffer.from(`I love IPFS <3 ${nanoid()}`)
      const remote = (await df.spawn({ type: 'js' })).api
      const proc = (await df.spawn({ type: 'proc' })).api
      proc.swarm.connect(remote.peerId.addresses[0])

      const files = await all(remote.add([{ path: 'awesome.txt', content: file }]))
      const data = await concat(proc.cat(files[0].cid))
      expect(data.slice()).to.eql(file)
      await df.clean()
    })
  })

  describe('unwant', () => {
    it('should throw error for invalid CID input', async () => {
      const proc = (await df.spawn({ type: 'proc' })).api
      try {
        await proc.bitswap.unwant('INVALID CID')
      } catch (err) {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
      } finally {
        await df.clean()
      }
    })
  })
})
