/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isWebWorker } = require('ipfs-utils/src/env')
const CID = require('cids')
const { randomBytes } = require('iso-random-stream')
const Block = require('ipld-block')
const concat = require('it-concat')
const { nanoid } = require('nanoid')
const uint8ArrayFromString = require('uint8arrays/from-string')
const pmap = require('p-map')
const multihashing = require('multihashing-async')
const getIpfsOptions = require('../utils/ipfs-options-websockets-filter-all')

const makeBlock = async () => {
  const d = uint8ArrayFromString(`IPFS is awesome ${nanoid()}`)
  const h = await multihashing(d, 'sha2-256')

  return new Block(d, new CID(h))
}

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const ipfsOptions = getIpfsOptions()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('transfer blocks', function () {
    this.timeout(60 * 1000)

    afterEach(() => factory.clean())

    describe('transfer a block between', () => {
      it('2 peers', async function () {
        // webworkers are not dialable because webrtc is not available
        const remote = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const local = (await factory.spawn({ type: 'proc', ipfsOptions })).api
        await local.swarm.connect(remote.peerId.addresses[0])
        const block = await makeBlock()

        await local.block.put(block)
        const b = await remote.block.get(block.cid)

        expect(b.data).to.eql(block.data)
      })

      it('3 peers', async () => {
        const blocks = await Promise.all([...Array(6).keys()].map(() => makeBlock()))
        const remote1 = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const remote2 = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const local = (await factory.spawn({ type: 'proc', ipfsOptions })).api
        await local.swarm.connect(remote1.peerId.addresses[0])
        await local.swarm.connect(remote2.peerId.addresses[0])
        await remote1.swarm.connect(remote2.peerId.addresses[0])

        await remote1.block.put(blocks[0])
        await remote1.block.put(blocks[1])
        await remote2.block.put(blocks[2])
        await remote2.block.put(blocks[3])
        await local.block.put(blocks[4])
        await local.block.put(blocks[5])

        await pmap(blocks, async (block) => {
          expect(await remote1.block.get(block.cid)).to.eql(block)
          expect(await remote2.block.get(block.cid)).to.eql(block)
          expect(await local.block.get(block.cid)).to.eql(block)
        }, { concurrency: 3 })
      })
    })

    describe('transfer a file between', () => {
      it('2 peers', async () => {
        const content = randomBytes(1024)
        const remote = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const local = (await factory.spawn({ type: 'proc', ipfsOptions })).api
        local.swarm.connect(remote.peerId.addresses[0])

        const file = await remote.add({ path: 'awesome.txt', content })
        const data = await concat(local.cat(file.cid))
        expect(data.slice()).to.eql(content)
      })
    })
  })
}
