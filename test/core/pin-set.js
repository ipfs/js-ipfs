/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const parallelLimit = require('async/parallelLimit')
const series = require('async/series')
const waterfall = require('async/waterfall')
const {
  util: {
    cid,
    serialize
  },
  DAGNode
} = require('ipld-dag-pb')
const CID = require('cids')

const IPFS = require('../../src/core')
const PinStore = require('../../src/core/components/pin/pin-store')
const PinSet = require('../../src/core/components/pin/pin-set')
const createTempRepo = require('../utils/create-repo-nodejs')

const emptyKeyHash = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
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
      createNode(String(i), (err, res) => cb(err, !err && res.cid.toBaseEncodedString()))
    )
  }

  parallelLimit(items, 500, callback)
}

function createNode (data, links = [], callback) {
  if (typeof links === 'function') {
    callback = links
    links = []
  }

  let node

  try {
    node = DAGNode.create(data, links)
  } catch (err) {
    return callback(err)
  }

  cid(serialize(node), { cidVersion: 0 }).then(cid => {
    callback(null, {
      node,
      cid
    })
  }, err => callback(err))
}

describe('pinSet', function () {
  let ipfs
  let pinSet
  let store
  let repo

  before(function (done) {
    this.timeout(80 * 1000)
    repo = createTempRepo()
    ipfs = new IPFS({
      repo,
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          }
        }
      }
    })
    ipfs.on('ready', () => {
      store = new PinStore(ipfs.dag)
      pinSet = new PinSet('recursive', store)
      done()
    })
  })

  after(function (done) {
    this.timeout(80 * 1000)
    ipfs.stop(done)
  })

  after((done) => repo.teardown(done))

  describe('storeItems', function () {
    it('generates a root node with links and hash', function (done) {
      const expectedRootHash = 'QmcLiSTjcjoVC2iuGbk6A2PVcWV3WvjZT4jxfNis1vjyrR'

      createNode('data', (err, result) => {
        expect(err).to.not.exist()
        const nodeHash = result.cid.toBaseEncodedString()

        // Store a single pin
        pinSet.storeSet([nodeHash], (err, rootNode) => {
          expect(err).to.not.exist()

          // Should have the correct CID
          expect(rootNode.cid.toBaseEncodedString()).to.eql(expectedRootHash)
          // Node should have links to `defaultFanout` empty bins + one pin
          expect(rootNode.node.Links).to.have.length(defaultFanout + 1)

          // Last link should be link to the pin
          const lastLink = rootNode.node.Links[rootNode.node.Links.length - 1]
          const mhash = lastLink.Hash.toBaseEncodedString()
          expect(mhash).to.eql(nodeHash)
          done()
        })
      })
    })
  })

  describe('handles large sets', function () {
    it('handles storing items > maxItems', function (done) {
      this.timeout(90 * 1000)
      const expectedHash = 'QmbvhSy83QWfgLXDpYjDmLWBFfGc8utoqjcXHyj3gYuasT'

      // Once there are more than maxItems pins, the pins should be distributed
      // across `defaultFanout` bins
      const count = maxItems + 1
      createNodes(count, (err, cids) => {
        expect(err).to.not.exist()

        pinSet.storeSet(cids, (err, result) => {
          expect(err).to.not.exist()

          expect(result.node.size).to.eql(3184696)

          // Pins should be distributed across `defaultFanout` bins
          expect(result.node.Links).to.have.length(defaultFanout)
          expect(result.cid.toBaseEncodedString()).to.eql(expectedHash)

          // Load the pins in the first bin
          pinSet.loadSetAt(result.node, 0, (err, loaded) => {
            expect(err).to.not.exist()

            // Should have 30 pins in it (the way the pins are created for
            // this test is deterministic and will result in 30 pins falling
            // into the first bin)
            expect(loaded).to.have.length(30)
            const hashes = loaded.map(l => new CID(l).toBaseEncodedString())

            // Make sure hasDescendant() finds a pin inside a bin.
            // Just check the first node, assume all are children if successful
            pinSet.hasDescendant(result.node, hashes[0], (err, has) => {
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

  describe('add and remove', function () {
    function loadThenCheck (ps, ks1, ks2, cb) {
      ps.saveSet((err, result) => {
        expect(err).to.not.exist()

        const rootNode = DAGNode.create('pins', [{ Hash: result.cid }])
        pinSet.loadSetAt(rootNode, 0, (err, loaded) => {
          expect(err).to.not.exist()

          expect([...ks1].sort()).eql([...ks2].sort())

          cb()
        })
      })
    }

    it('adds pins', function (done) {
      const testPinSet = new PinSet('recursive', store)

      createNodes(5, (err, keys) => {
        expect(err).to.not.exist()

        testPinSet.addPins(keys, (err) => {
          expect(err).to.not.exist()

          loadThenCheck(testPinSet, testPinSet.pinKeys, keys, done)
        })
      })
    })

    it('removes pins', function (done) {
      const testPinSet = new PinSet('recursive', store)

      createNodes(5, (err, keys) => {
        expect(err).to.not.exist()

        series([
          (cb) => testPinSet.addPins(keys, cb),
          (cb) => testPinSet.rmPins([keys[1], keys[3]], cb),
          (cb) => loadThenCheck(testPinSet, testPinSet.pinKeys, [keys[0], keys[2], keys[4]], cb)
        ], done)
      })
    })

    it('add existing pins has no effect', function (done) {
      const testPinSet = new PinSet('recursive', store)

      createNodes(5, (err, keys) => {
        expect(err).to.not.exist()

        waterfall([
          (cb) => testPinSet.addPins(keys, cb),
          (changed, cb) => testPinSet.addPins(keys, cb)
        ], (err, changed) => {
          expect(err).to.not.exist()

          expect(changed).equal(false)
          done()
        })
      })
    })

    it('remove non-existent pins has no effect', function (done) {
      const testPinSet = new PinSet('recursive', store)

      createNodes(5, (err, keys) => {
        expect(err).to.not.exist()

        waterfall([
          (cb) => testPinSet.addPins(keys, cb),
          (changed, cb) => testPinSet.rmPins([keys[1], keys[3]], cb),
          (changed, cb) => testPinSet.rmPins([keys[1], keys[3]], cb)
        ], (err, changed) => {
          expect(err).to.not.exist()

          expect(changed).equal(false)
          done()
        })
      })
    })

    it('several adds and removes results in correct pin set', function (done) {
      const testPinSet = new PinSet('recursive', store)

      createNodes(5, (err, keys) => {
        expect(err).to.not.exist()

        series([
          // [0, 1, 2, 3, 4]
          (cb) => testPinSet.addPins(keys, cb),

          // [0, -, -, -, 4]
          (cb) => testPinSet.rmPins([keys[1], keys[2], keys[3]], cb),

          // [0, 1, -, 3, 4]
          (cb) => testPinSet.addPins([keys[0], keys[1], keys[3]], cb),

          // [0, -, -, 3, 4]
          (cb) => testPinSet.rmPins([keys[1], keys[2]], cb)
        ], (err) => {
          expect(err).to.not.exist()

          loadThenCheck(testPinSet, testPinSet.pinKeys, [keys[0], keys[3], keys[4]], done)
        })
      })
    })
  })

  describe('walkItems', function () {
    it(`fails if node doesn't have a pin-set protobuf header`, function (done) {
      createNode('datum', (err, node) => {
        expect(err).to.not.exist()

        pinSet.walkItems(node, {}, (err, res) => {
          expect(err).to.exist()
          expect(res).to.not.exist()
          done()
        })
      })
    })

    it('visits all links of a root node', function (done) {
      this.timeout(90 * 1000)

      const binsPerNode = 5
      const itemsPerNode = 20
      const testPinSet = new PinSet('recursive', store, binsPerNode, itemsPerNode)

      const seenPins = []
      const stepPin = (link, idx, data) => seenPins.push({ link, idx, data })
      const seenBins = []
      const stepBin = (link, idx, data) => seenBins.push({ link, idx, data })

      // Generate enough pins that they will be distributed across a structure
      // of bins that is a few levels deep
      const numPins = binsPerNode * itemsPerNode * 5
      createNodes(numPins, (err, nodes) => {
        expect(err).to.not.exist()

        testPinSet.storeSet(nodes, (err, result) => {
          expect(err).to.not.exist()

          testPinSet.walkItems(result.node, { stepPin, stepBin }, err => {
            expect(err).to.not.exist()

            // Walking the structure we should see every pin
            expect(seenPins).to.have.length(numPins)
            // The way pins are generated for the tests is deterministic, and
            // will result in 80 bins being created
            expect(seenBins).to.have.length(80)

            for (const item of seenPins) {
              expect(item.data).to.eql(Buffer.alloc(0))
              expect(item.link).to.exist()
            }

            done()
          })
        })
      })
    })
  })

  describe('getInternalCids', function () {
    it('gets all links and empty key CID', function (done) {
      const binsPerNode = 5
      const itemsPerNode = 20
      const testPinSet = new PinSet('recursive', store, binsPerNode, itemsPerNode)

      // Generate enough pins that they will be distributed across a structure
      // of bins that is a few levels deep
      const numPins = binsPerNode * itemsPerNode * 5

      createNodes(numPins, (err, nodes) => {
        expect(err).to.not.exist()

        testPinSet.storeSet(nodes, (err, result) => {
          expect(err).to.not.exist()

          const rootNode = DAGNode.create('pins', [{ Hash: result.cid }])
          PinSet.getInternalCids(store, rootNode, (err, cids) => {
            expect(err).to.not.exist()

            // The way pins are generated for the tests is deterministic, and
            // will result in 82 internal cids being created
            expect(cids.length).to.eql(82)

            const cidStrs = cids.map(c => c.toString())
            // Should include the empty key hash
            expect(cidStrs).includes(emptyKeyHash)
            // Should include the set root node
            expect(cidStrs).includes(result.cid.toString())

            done()
          })
        })
      })
    })
  })
})
