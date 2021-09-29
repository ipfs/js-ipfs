/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { isWebWorker } from 'ipfs-utils/src/env.js'
import { randomBytes } from 'iso-random-stream'
import concat from 'it-concat'
import { nanoid } from 'nanoid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import pmap from 'p-map'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 * @typedef {import('multiformats').CID} CID
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testTransfer (factory, options) {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('transfer blocks', function () {
    this.timeout(60 * 1000)

    afterEach(() => factory.clean())

    describe('transfer a block between', () => {
      it('2 peers', async function () {
        // webworkers are not dialable because webrtc is not available
        const remote = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const remoteId = await remote.id()
        const local = (await factory.spawn({ type: 'proc', ipfsOptions })).api
        await local.swarm.connect(remoteId.addresses[0])
        const data = uint8ArrayFromString(`IPFS is awesome ${nanoid()}`)

        const cid = await local.block.put(data)
        const b = await remote.block.get(cid)

        expect(b).to.equalBytes(data)
      })

      it('3 peers', async () => {
        const blocks = Array(6).fill(0).map(() => uint8ArrayFromString(`IPFS is awesome ${nanoid()}`))
        const remote1 = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const remote1Id = await remote1.id()
        const remote2 = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
        const remote2Id = await remote2.id()
        const local = (await factory.spawn({ type: 'proc', ipfsOptions })).api
        await local.swarm.connect(remote1Id.addresses[0])
        await local.swarm.connect(remote2Id.addresses[0])
        await remote1.swarm.connect(remote2Id.addresses[0])

        // order is important
        /** @type {CID[]} */
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
        const remoteId = await remote.id()
        const local = (await factory.spawn({ type: 'proc', ipfsOptions })).api
        local.swarm.connect(remoteId.addresses[0])

        const file = await remote.add({ path: 'awesome.txt', content })
        const data = await concat(local.cat(file.cid))
        expect(data.slice()).to.eql(content)
      })
    })
  })
}
