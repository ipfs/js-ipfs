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
const CID = require('CIDs')

const IPFS = require('../../src/core')
const createTempRepo = require('../utils/create-repo-nodejs')

const defaultFanout = 256
const maxItems = 8192

function noop () {}

/**
 * Creates @param num DAGNodes, limited to 500 at a time to save memory
 * @param  {[type]}   num      the number of nodes to create
 * @param  {Function} callback node-style callback, result is an Array of all
 *                              created nodes
 * @return {void}
 */
function createNodes (num, callback) {
  let items = []
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

describe('pinset', function () {
  let ipfs
  let pinset
  let repo

  before(function (done) {
    this.timeout(20 * 1000)
    repo = createTempRepo()
    ipfs = new IPFS({ repo })
    ipfs.on('ready', () => {
      pinset = ipfs.pin.set
      done()
    })
  })

  after(done => ipfs.stop(done))

  describe('storeItems', function () {
    it('generates a root node with links and hash', function (done) {
      const expectedRootHash = 'QmYrQ8xraCsNsvziXhMLgCCcaiLqRGVXcTwsynrJkacDPq'

      createNode('data', (err, node) => {
        expect(err).to.not.exist()
        const nodeHash = node._multihash

        pinset.storeSet([nodeHash], noop, (err, rootNode) => {
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
      const expectedHash = 'QmWKEc6JAq1bKQ6jyFLtoVB5PBApBk1FYjgYekj9sMQgT6'
      const count = maxItems + 1
      createNodes(count, (err, nodes) => {
        expect(err).to.not.exist()
        pinset.storeSet(nodes, noop, (err, node) => {
          expect(err).to.not.exist()

          node = node.toJSON()
          expect(node.size).to.eql(3183411)
          expect(node.links).to.have.length(defaultFanout)
          expect(node.multihash).to.eql(expectedHash)

          pinset.loadSet(node, '', noop, (err, loaded) => {
            expect(err).to.not.exist()
            expect(loaded).to.have.length(30)
            const hashes = loaded.map(l => new CID(l).toBaseEncodedString())

            // just check the first node, assume all are children if successful
            pinset.hasChild(node, hashes[0], (err, has) => {
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
    // infinite. We need to reference go's pinset impl to make sure
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
          cb => pinset.storeSet(nodes.slice(0, -1), noop, (err, res) => {
            expect(err).to.not.exist()
            cb(null, res)
          }),
          cb => pinset.storeSet(nodes, noop, (err, res) => {
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

        pinset.walkItems(node, noop, noop, (err, res) => {
          expect(err).to.exist()
          expect(res).to.not.exist()
          done()
        })
      })
    })

    it('visits all non-fanout links of a root node', function (done) {
      const seen = []
      const walk = (link, idx, data) => seen.push({ link, idx, data })

      createNodes(defaultFanout, (err, nodes) => {
        expect(err).to.not.exist()

        pinset.storeSet(nodes, noop, (err, node) => {
          expect(err).to.not.exist()

          pinset.walkItems(node, walk, noop, err => {
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
