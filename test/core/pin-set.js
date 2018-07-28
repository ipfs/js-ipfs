/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallelLimit = require('async/parallelLimit')
const series = require('async/series')
const { fromB58String } = require('multihashes')
const { DAGNode } = require('ipld-dag-pb')
const CID = require('cids')

const IPFS = require('../../src/core')
const createPinSet = require('../../src/core/components/pin-set')
const createTempRepo = require('../utils/create-repo-nodejs')

const defaultFanout = 256
const maxItems = 8192

/**
 * Creates @param num DAGNodes, limited to 500 at a time to save memory
 * @param  {[type]}   num      the number of nodes to create
 * @param  {Function} callback node-style callback, result is an Array of all
 *                              created nodes
 * @return {void}
 */
function createNodes (num, callback) {
  const items = []
  for (let i = 0; i < num; i++) {
    items.push(cb =>
      createNode(String(i), (err, node) => cb(err, node._multihash))
    )
  }

  parallelLimit(items, 500, callback)
}

function createNode (data, links = [], callback) {
  if (typeof links === 'function') {
    callback = links
    links = []
  }

  DAGNode.create(data, links, callback)
}

describe('pinSet', function () {
  let ipfs
  let pinSet
  let repo

  before(function (done) {
    this.timeout(80 * 1000)
    repo = createTempRepo()
    ipfs = new IPFS({ repo })
    ipfs.on('ready', () => {
      pinSet = createPinSet(ipfs.dag)
      done()
    })
  })

  after(function (done) {
    this.timeout(80 * 1000)
    ipfs.stop(done)
  })

  describe('storeItems', function () {
    it('generates a root node with links and hash', function (done) {
      const expectedRootHash = 'QmcLiSTjcjoVC2iuGbk6A2PVcWV3WvjZT4jxfNis1vjyrR'

      createNode('data', (err, node) => {
        expect(err).to.not.exist()
        const nodeHash = node._multihash
        pinSet.storeSet([nodeHash], (err, rootNode) => {
          expect(err).to.not.exist()
          const node = rootNode.toJSON()
          expect(node.multihash).to.eql(expectedRootHash)
          expect(node.links).to.have.length(defaultFanout + 1)

          const lastLink = node.links[node.links.length - 1]
          const mhash = fromB58String(lastLink.multihash)
          expect(mhash).to.eql(nodeHash)
          done()
        })
      })
    })
  })

  describe('handles large sets', function () {
    it('handles storing items > maxItems', function (done) {
      this.timeout(19 * 1000)
      const expectedHash = 'QmbvhSy83QWfgLXDpYjDmLWBFfGc8utoqjcXHyj3gYuasT'
      const count = maxItems + 1
      createNodes(count, (err, nodes) => {
        expect(err).to.not.exist()
        pinSet.storeSet(nodes, (err, node) => {
          expect(err).to.not.exist()

          node = node.toJSON()
          expect(node.size).to.eql(3184696)
          expect(node.links).to.have.length(defaultFanout)
          expect(node.multihash).to.eql(expectedHash)

          pinSet.loadSet(node, '', (err, loaded) => {
            expect(err).to.not.exist()
            expect(loaded).to.have.length(30)
            const hashes = loaded.map(l => new CID(l).toBaseEncodedString())

            // just check the first node, assume all are children if successful
            pinSet.hasDescendant(node, hashes[0], (err, has) => {
              expect(err).to.not.exist()
              expect(has).to.eql(true)
              done()
            })
          })
        })
      })
    })

    // This test is largely taken from go-ipfs/pin/set_test.go
    // It fails after reaching maximum call stack depth but I don't believe it's
    // infinite. We need to reference go's pinSet impl to make sure
    // our sharding behaves correctly, or perhaps this test is misguided
    it.skip('stress test: stores items > (maxItems * defaultFanout) + 1', function (done) {
      this.timeout(180 * 1000)

      // this value triggers the creation of a recursive shard.
      // If the recursive sharding is done improperly, this will result in
      // an infinite recursion and crash (OOM)
      const limit = (defaultFanout * maxItems) + 1

      createNodes(limit, (err, nodes) => {
        expect(err).to.not.exist()
        series([
          cb => pinSet.storeSet(nodes.slice(0, -1), (err, res) => {
            expect(err).to.not.exist()
            cb(null, res)
          }),
          cb => pinSet.storeSet(nodes, (err, res) => {
            expect(err).to.not.exist()
            cb(null, res)
          })
        ], (err, rootNodes) => {
          expect(err).to.not.exist()
          expect(rootNodes[1].length - rootNodes[2].length).to.eql(2)
          done()
        })
      })
    })
  })

  describe('walkItems', function () {
    it(`fails if node doesn't have a pin-set protobuf header`, function (done) {
      createNode('datum', (err, node) => {
        expect(err).to.not.exist()

        pinSet.walkItems(node, () => {}, (err, res) => {
          expect(err).to.exist()
          expect(res).to.not.exist()
          done()
        })
      })
    })

    it('visits all non-fanout links of a root node', function (done) {
      const seen = []
      const walker = (link, idx, data) => seen.push({ link, idx, data })

      createNodes(defaultFanout, (err, nodes) => {
        expect(err).to.not.exist()

        pinSet.storeSet(nodes, (err, node) => {
          expect(err).to.not.exist()

          pinSet.walkItems(node, walker, err => {
            expect(err).to.not.exist()
            expect(seen).to.have.length(defaultFanout)
            expect(seen[0].idx).to.eql(defaultFanout)
            seen.forEach(item => {
              expect(item.data).to.eql(Buffer.alloc(0))
              expect(item.link).to.exist()
            })
            done()
          })
        })
      })
    })
  })
})
