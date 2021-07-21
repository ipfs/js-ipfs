/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const { isWebWorker } = require('ipfs-utils/src/env')
const { randomBytes } = require('iso-random-stream')
const concat = require('it-concat')
const { nanoid } = require('nanoid')
const uint8ArrayFromString = require('uint8arrays/from-string')
const pmap = require('p-map')
const getIpfsOptions = require('../utils/ipfs-options-websockets-filter-all')

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
        const data = uint8ArrayFromString(`IPFS is awesome ${nanoid()}`)

        const cid = await local.block.put(data)
        const b = await remote.block.get(cid)

        expect(b).to.equalBytes(data)
      })

      it('3 peers', async () => {
        const blocks = Array(6).fill(0).map(() => uint8ArrayFromString(`IPFS is awesome ${nanoid()}`))
        const remote1 = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const remote2 = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const local = (await factory.spawn({ type: 'proc', ipfsOptions })).api
        await local.swarm.connect(remote1.peerId.addresses[0])
        await local.swarm.connect(remote2.peerId.addresses[0])
        await remote1.swarm.connect(remote2.peerId.addresses[0])

        // order is important
        const cids = []
        cids.push(await remote1.block.put(blocks[0]))
        cids.push(await remote1.block.put(blocks[1]))
        cids.push(await remote2.block.put(blocks[2]))
        cids.push(await remote2.block.put(blocks[3]))
        cids.push(await local.block.put(blocks[4]))
        cids.push(await local.block.put(blocks[5]))

        await pmap(blocks, async (block, i) => {
          expect(await remote1.block.get(cids[i])).to.eql(block)
          expect(await remote2.block.get(cids[i])).to.eql(block)
          expect(await local.block.get(cids[i])).to.eql(block)
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
