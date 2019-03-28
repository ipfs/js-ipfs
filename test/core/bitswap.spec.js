/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const _ = require('lodash')
const series = require('async/series')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const Block = require('ipfs-block')
const multiaddr = require('multiaddr')
const isNode = require('detect-node')
const multihashing = require('multihashing-async')
const CID = require('cids')

const IPFSFactory = require('ipfsd-ctl')

const IPFS = require('../../src/core')

function makeBlock (callback) {
  const d = Buffer.from(`IPFS is awesome ${Math.random()}`)

  multihashing(d, 'sha2-256', (err, multihash) => {
    if (err) {
      return callback(err)
    }
    callback(null, new Block(d, new CID(multihash)))
  })
}

function wire (targetNode, dialerNode, callback) {
  targetNode.id((err, identity) => {
    expect(err).to.not.exist()
    const addr = identity.addresses
      .map((addr) => multiaddr(addr.toString().split('ipfs')[0]))
      .filter((addr) => _.includes(addr.protoNames(), 'ws'))[0]

    if (!addr) {
      // Note: the browser doesn't have a websockets listening addr
      return callback()
    }

    const targetAddr = addr
      .encapsulate(multiaddr(`/ipfs/${identity.id}`)).toString()
      .replace('0.0.0.0', '127.0.0.1')

    dialerNode.swarm.connect(targetAddr, callback)
  })
}

function connectNodes (remoteNode, inProcNode, callback) {
  series([
    (cb) => wire(remoteNode, inProcNode, cb),
    // need timeout so we wait for identify to happen.
    // This call is just to ensure identify happened
    (cb) => setTimeout(() => wire(inProcNode, remoteNode, cb), 500)
  ], callback)
}

let nodes = []

function addNode (fDaemon, inProcNode, callback) {
  fDaemon.spawn({
    exec: './src/cli/bin.js',
    initOptions: { bits: 512 },
    config: {
      Addresses: {
        Swarm: [`/ip4/127.0.0.1/tcp/0/ws`]
      },
      Discovery: {
        MDNS: {
          Enabled: false
        }
      },
      Bootstrap: []
    }
  }, (err, ipfsd) => {
    expect(err).to.not.exist()
    nodes.push(ipfsd)
    connectNodes(ipfsd.api, inProcNode, (err) => callback(err, ipfsd.api))
  })
}

describe('bitswap', function () {
  this.timeout(80 * 1000)

  let inProcNode // Node spawned inside this process
  let fDaemon
  let fInProc

  before(function () {
    fDaemon = IPFSFactory.create({ type: 'js' })
    fInProc = IPFSFactory.create({ type: 'proc' })
  })

  beforeEach(function (done) {
    this.timeout(60 * 1000)

    let config = {
      Addresses: {
        Swarm: []
      },
      Discovery: {
        MDNS: {
          Enabled: false
        }
      },
      Bootstrap: []
    }

    if (isNode) {
      config = Object.assign({}, config, {
        Addresses: {
          Swarm: ['/ip4/127.0.0.1/tcp/0']
        }
      })
    }

    fInProc.spawn({
      exec: IPFS,
      config: config,
      initOptions: { bits: 512 }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      nodes.push(_ipfsd)
      inProcNode = _ipfsd.api
      done()
    })
  })

  afterEach(function (done) {
    this.timeout(80 * 1000)
    const tasks = nodes.map((node) => (cb) => node.stop(cb))
    parallel(tasks, (err) => {
      expect(err).to.not.exist()
      nodes = []
      done()
    })
  })

  describe('transfer a block between', () => {
    it('2 peers', function (done) {
      this.timeout(80 * 1000)

      let remoteNode
      let block
      waterfall([
        (cb) => parallel([
          (cb) => makeBlock(cb),
          (cb) => addNode(fDaemon, inProcNode, cb)
        ], cb),
        (res, cb) => {
          block = res[0]
          remoteNode = res[1]
          cb()
        },
        (cb) => remoteNode.block.put(block, cb),
        (key, cb) => inProcNode.block.get(block.cid, cb),
        (b, cb) => {
          expect(b.data).to.eql(block.data)
          cb()
        }
      ], done)
    })

    it('3 peers', function (done) {
      this.timeout(80 * 1000)

      let blocks
      const remoteNodes = []

      series([
        (cb) => parallel(_.range(6).map((i) => makeBlock), (err, _blocks) => {
          expect(err).to.not.exist()
          blocks = _blocks
          cb()
        }),
        (cb) => addNode(fDaemon, inProcNode, (err, _ipfs) => {
          remoteNodes.push(_ipfs)
          cb(err)
        }),
        (cb) => addNode(fDaemon, inProcNode, (err, _ipfs) => {
          remoteNodes.push(_ipfs)
          cb(err)
        }),
        (cb) => connectNodes(remoteNodes[0], remoteNodes[1], cb),
        (cb) => remoteNodes[0].block.put(blocks[0], cb),
        (cb) => remoteNodes[0].block.put(blocks[1], cb),
        (cb) => remoteNodes[1].block.put(blocks[2], cb),
        (cb) => remoteNodes[1].block.put(blocks[3], cb),
        (cb) => inProcNode.block.put(blocks[4], cb),
        (cb) => inProcNode.block.put(blocks[5], cb),
        // 3. Fetch blocks on all nodes
        (cb) => parallel(_.range(6).map((i) => (cbI) => {
          const check = (n, cid, callback) => {
            n.block.get(cid, (err, b) => {
              expect(err).to.not.exist()
              expect(b).to.eql(blocks[i])
              callback()
            })
          }

          series([
            (cbJ) => check(remoteNodes[0], blocks[i].cid, cbJ),
            (cbJ) => check(remoteNodes[1], blocks[i].cid, cbJ),
            (cbJ) => check(inProcNode, blocks[i].cid, cbJ)
          ], cbI)
        }), cb)
      ], done)
    })
  })

  describe('transfer a file between', function () {
    this.timeout(160 * 1000)

    it('2 peers', (done) => {
      // TODO make this test more interesting (10Mb file)
      // TODO remove randomness from the test
      const file = Buffer.from(`I love IPFS <3 ${Math.random()}`)

      waterfall([
        // 0. Start node
        (cb) => addNode(fDaemon, inProcNode, cb),
        // 1. Add file to tmp instance
        (remote, cb) => {
          remote.add([{ path: 'awesome.txt', content: file }], cb)
        },
        // 2. Request file from local instance
        (filesAdded, cb) => inProcNode.cat(filesAdded[0].hash, cb)
      ], (err, data) => {
        expect(err).to.not.exist()
        expect(data).to.eql(file)
        done()
      })
    })
  })

  describe('unwant', () => {
    it('should callback with error for invalid CID input', (done) => {
      inProcNode.bitswap.unwant('INVALID CID', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
        done()
      })
    })
  })
})
