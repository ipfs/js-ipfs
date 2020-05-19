/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const { util, DAGNode } = require('ipld-dag-pb')
const { Buffer } = require('buffer')
const CID = require('cids')
const map = require('p-map')
const IPFS = require('../../src/core')
const createPinSet = require('../../src/core/components/pin/pin-set')
const createTempRepo = require('../utils/create-repo-nodejs')

const emptyKeyHash = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
const defaultFanout = 256
const maxItems = 8192

/**
 * Creates @param num DAGNodes, limited to 500 at a time to save memory
 * @param  {[type]}   num      the number of nodes to create
 * @return {Promise<Array<{ node: DAGNode, cid: CID }>>}
 */
function createNodes (num) {
  return map(Array.from(Array(num)), (_, i) => createNode(String(i)), { concurrency: 500 })
}

async function createNode (data, links = []) {
  const node = new DAGNode(data, links)
  const cid = await util.cid(util.serialize(node), { cidVersion: 0 })
  return { node, cid }
}

describe('pinSet', function () {
  let ipfs
  let pinSet
  let repo

  before(async function () {
    this.timeout(80 * 1000)
    repo = createTempRepo()
    ipfs = await IPFS.create({
      silent: true,
      repo,
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          }
        }
      },
      preload: { enabled: false }
    })
    pinSet = createPinSet(ipfs.dag)
  })

  after(function () {
    this.timeout(80 * 1000)
    return ipfs.stop()
  })

  after(() => repo.teardown())

  describe('storeItems', function () {
    it('generates a root node with links and hash', async function () {
      const expectedRootHash = 'QmcLiSTjcjoVC2iuGbk6A2PVcWV3WvjZT4jxfNis1vjyrR'

      const result = await createNode('data')
      const nodeHash = result.cid.toBaseEncodedString()
      const rootNode = await pinSet.storeSet([nodeHash])

      expect(rootNode.cid.toBaseEncodedString()).to.eql(expectedRootHash)
      expect(rootNode.node.Links).to.have.length(defaultFanout + 1)

      const lastLink = rootNode.node.Links[rootNode.node.Links.length - 1]
      const mhash = lastLink.Hash.toBaseEncodedString()
      expect(mhash).to.eql(nodeHash)
    })
  })

  describe('handles large sets', function () {
    it('handles storing items > maxItems', async function () {
      this.timeout(90 * 1000)
      const expectedHash = 'QmbvhSy83QWfgLXDpYjDmLWBFfGc8utoqjcXHyj3gYuasT'
      const count = maxItems + 1
      const nodes = await createNodes(count)
      const result = await pinSet.storeSet(nodes.map(n => n.cid))

      expect(result.node.size).to.eql(3184696)
      expect(result.node.Links).to.have.length(defaultFanout)
      expect(result.cid.toBaseEncodedString()).to.eql(expectedHash)

      const loaded = await pinSet.loadSet(result.node, '')
      expect(loaded).to.have.length(30)

      const hashes = loaded.map(l => new CID(l).toBaseEncodedString())

      // just check the first node, assume all are children if successful
      const has = await pinSet.hasDescendant(result.cid, hashes[0])
      expect(has).to.eql(true)
    })

    // This test is largely taken from go-ipfs/pin/set_test.go
    // It fails after reaching maximum call stack depth but I don't believe it's
    // infinite. We need to reference go's pinSet impl to make sure
    // our sharding behaves correctly, or perhaps this test is misguided
    //
    // FIXME: Update: AS 2020-01-14 this test currently is failing with:
    //
    // TypeError: Cannot read property 'length' of undefined
    //   at storePins (src/core/components/pin/pin-set.js:195:18)
    //   at storePins (src/core/components/pin/pin-set.js:231:33)
    //   at storePins (src/core/components/pin/pin-set.js:231:33)
    //   at Object.storeItems (src/core/components/pin/pin-set.js:178:14)
    //   at Object.storeSet (src/core/components/pin/pin-set.js:163:37)
    //   at Context.<anonymous> (test/core/pin-set.js:116:39)
    //   at processTicksAndRejections (internal/process/task_queues.js:94:5)
    it.skip('stress test: stores items > (maxItems * defaultFanout) + 1', async function () {
      this.timeout(180 * 1000)

      // this value triggers the creation of a recursive shard.
      // If the recursive sharding is done improperly, this will result in
      // an infinite recursion and crash (OOM)
      const limit = (defaultFanout * maxItems) + 1

      const nodes = await createNodes(limit)
      const rootNodes0 = await pinSet.storeSet(nodes.slice(0, -1).map(n => n.cid))
      const rootNodes1 = await pinSet.storeSet(nodes.map(n => n.cid))

      expect(rootNodes0.length - rootNodes1.length).to.eql(2)
    })
  })

  describe('walkItems', function () {
    it('fails if node doesn\'t have a pin-set protobuf header', async function () {
      const { node } = await createNode('datum')
      await expect(pinSet.walkItems(node, {}))
        .to.eventually.be.rejected()
    })

    it('visits all links of a root node', async function () {
      this.timeout(90 * 1000)

      const seenPins = []
      const stepPin = (link, idx, data) => seenPins.push({ link, idx, data })
      const seenBins = []
      const stepBin = (link, idx, data) => seenBins.push({ link, idx, data })

      const nodes = await createNodes(maxItems + 1)
      const result = await pinSet.storeSet(nodes.map(n => n.cid))

      await pinSet.walkItems(result.node, { stepPin, stepBin })
      expect(seenPins).to.have.length(maxItems + 1)
      expect(seenBins).to.have.length(defaultFanout)
    })

    it('visits all non-fanout links of a root node', async () => {
      const seen = []
      const stepPin = (link, idx, data) => seen.push({ link, idx, data })

      const nodes = await createNodes(defaultFanout)
      const result = await pinSet.storeSet(nodes.map(n => n.cid))

      await pinSet.walkItems(result.node, { stepPin })

      expect(seen).to.have.length(defaultFanout)
      expect(seen[0].idx).to.eql(defaultFanout)

      seen.forEach(item => {
        expect(item.data).to.eql(Buffer.alloc(0))
        expect(item.link).to.exist()
      })
    })
  })

  describe('getInternalCids', function () {
    it('gets all links and empty key CID', async () => {
      const nodes = await createNodes(defaultFanout)
      const result = await pinSet.storeSet(nodes.map(n => n.cid))

      const rootNode = new DAGNode('pins', [{ Hash: result.cid }])
      const cids = await pinSet.getInternalCids(rootNode)

      expect(cids.length).to.eql(2)
      const cidStrs = cids.map(c => c.toString())
      expect(cidStrs).includes(emptyKeyHash)
      expect(cidStrs).includes(result.cid.toString())
    })
  })
})
