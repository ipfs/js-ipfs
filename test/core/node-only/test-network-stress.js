/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
// const parallel = require('run-parallel')

const createTempNode = require('../../utils/temp-node')
const spawnNode = require('../../utils/spawn-ipfs-node').spawnNode

describe('network stress tests', function () {
  this.timeout(20 * 1000)

  describe('1 connected node (TCP)', () => {
    let node
    let subNodes = []

    it('spawn in process node', (done) => {
      createTempNode(100, (err, tmpNode) => {
        expect(err).to.not.exist
        node = tmpNode
        done()
      })
    })

    it('start node', (done) => {
      node.goOnline(done)
    })

    it('spawn a node in a child process', (done) => {
      spawnNode(['tcp'], (err, subNode) => {
        expect(err).to.not.exist
        subNode.addr = subNode.nodeInfo.Addresses[0] + '/ipfs/' + subNode.nodeInfo.ID
        subNodes.push(subNode)
        console.log('spawn:', subNode.addr)
        done()
      })
    })

    it('connect to child node', (done) => {
      node.libp2p.swarm.connect(subNodes[0].addr, done)
    })

    it.skip('do not crash if there is a stream hanging', (done) => {
      node._libp2pNode.dialByMultiaddr(subNodes[0].addr, '/echo/1.0.0', (err, conn) => {
        expect(err).to.not.exist
        done()
      })
    })

    it('send 10000 msg', (done) => {
      node._libp2pNode.dialByMultiaddr(subNodes[0].addr, '/echo/1.0.0', (err, conn) => {
        expect(err).to.not.exist
        conn.resume()
        conn.end()
        conn.on('end', done)
      })
    })

    it.skip('send 10000 msg (2x)', (done) => {})

    it.skip('send 10000 msg (3x)', (done) => {})

    it('kill child node', (done) => {
      subNodes[0].sigkill()
      setTimeout(done, 200)
    })
    it.skip('check in process node', (done) => {})

    it('stop node', (done) => {
      node.goOffline(done)
    })
  })

  describe('5 connected nodes (TCP)', () => {})
  describe('10 connected nodes (TCP)', () => {})
  describe('20 connected nodes (TCP)', () => {})
  describe('20 connected nodes (TCP+WebSockets)', () => {})
})
