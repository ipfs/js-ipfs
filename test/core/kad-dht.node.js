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
  Bootstrap: [],
  Discovery: {
    MDNS: {
      Enabled: false
    },
    webRTCStar: {
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

describe('kad-dht is routing content and peers correctly', () => {
  let nodeA
  let nodeB
  let nodeC
  let addrB
  let addrC

  let nodes
  before(function (done) {
    this.timeout(30 * 1000)

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

  it('add a file in B, fetch in A', function (done) {
    this.timeout(30 * 1000)
    const file = {
      path: 'testfile1.txt',
      content: Buffer.from('hello kad 1')
    }

    nodeB.add(file, (err, filesAdded) => {
      expect(err).to.not.exist()

      nodeA.cat(filesAdded[0].hash, (err, data) => {
        expect(err).to.not.exist()
        expect(data).to.eql(file.content)
        done()
      })
    })
  })

  it('add a file in C, fetch through B in A', function (done) {
    this.timeout(30 * 1000)
    const file = {
      path: 'testfile2.txt',
      content: Buffer.from('hello kad 2')
    }

    nodeC.add(file, (err, filesAdded) => {
      expect(err).to.not.exist()

      nodeA.cat(filesAdded[0].hash, (err, data) => {
        expect(err).to.not.exist()
        expect(data).to.eql(file.content)
        done()
      })
    })
  })
})
