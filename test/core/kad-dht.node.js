/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const parallel = require('async/parallel')

const IPFSFactory = require('ipfsd-ctl')
const f = IPFSFactory.create({ type: 'js' })

const config = {
  Addresses: {
    Swarm: [`/ip4/127.0.0.1/tcp/0`, `/ip4/127.0.0.1/tcp/0/ws`],
    API: `/ip4/127.0.0.1/tcp/0`,
    Gateway: `/ip4/127.0.0.1/tcp/0`
  },
  Bootstrap: [],
  Discovery: {
    MDNS: {
      Enabled: false
    }
  }
}

function createNode (callback) {
  f.spawn({
    exec: './src/cli/bin.js',
    config,
    initOptions: { bits: 512 }
  }, callback)
}

describe.skip('verify that kad-dht is doing its thing', () => {
  let nodeA
  let nodeB
  let nodeC
  // let addrA
  let addrB
  let addrC

  let nodes
  before((done) => {
    parallel([
      (cb) => createNode(cb),
      (cb) => createNode(cb),
      (cb) => createNode(cb)
    ], (err, _nodes) => {
      expect(err).to.not.exist()
      nodes = _nodes
      nodeA = _nodes[0].api
      nodeB = _nodes[1].api
      nodeC = _nodes[2].api
      parallel([
        (cb) => nodeA.id(cb),
        (cb) => nodeB.id(cb),
        (cb) => nodeC.id(cb)
      ], (err, ids) => {
        expect(err).to.not.exist()
        // addrA = ids[0].addresses[0]
        addrB = ids[1].addresses[0]
        addrC = ids[2].addresses[0]
        parallel([
          (cb) => nodeA.swarm.connect(addrB, cb),
          (cb) => nodeB.swarm.connect(addrC, cb)
        ], done)
      })
    })
  })

  after((done) => parallel(nodes.map((node) => (cb) => node.stop(cb)), done))

  it.skip('add a file in C, fetch through B in A', (done) => {
    const file = {
      path: 'testfile.txt',
      content: Buffer.from('hello kad')
    }

    nodeC.add(file, (err, filesAdded) => {
      expect(err).to.not.exist()

      nodeA.cat(filesAdded[0].hash, (err, data) => {
        expect(err).to.not.exist()
        expect(data.length).to.equal(file.data.length)
        expect(data).to.eql(file.data)
        done()
      })
    })
  })
})
