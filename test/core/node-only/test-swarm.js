/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const parallel = require('run-parallel')

const createTempNode = require('../../utils/temp-node')

describe('swarm', function () {
  this.timeout(40 * 1000)

  let nodeA
  let nodeB

  // let nodeAMultiaddr
  let nodeBMultiaddr

  it('create 2 temporary nodes', (done) => {
    parallel([
      (cb) => {
        createTempNode(2, (err, tmpNode) => {
          expect(err).to.not.exist
          nodeA = tmpNode
          cb()
        })
      },
      (cb) => {
        createTempNode(3, (err, tmpNode) => {
          expect(err).to.not.exist
          nodeB = tmpNode
          cb()
        })
      }
    ], done)
  })

  it('get each peer addr', (done) => {
    parallel([
      (cb) => {
        nodeA.id((err, res) => {
          expect(err).to.not.exist
          // nodeAMultiaddr = `${res.Addresses[0]}/ipfs/${res.ID}`
          cb()
        })
      },
      (cb) => {
        nodeB.id((err, res) => {
          expect(err).to.not.exist
          nodeBMultiaddr = `${res.Addresses[0]}/ipfs/${res.ID}`
          cb()
        })
      }
    ], done)
  })

  it('start 2 nodes', (done) => {
    parallel([
      nodeA.goOnline,
      nodeB.goOnline
    ], done)
  })

  it('libp2p.swarm.connect nodeA to nodeB', (done) => {
    nodeA.libp2p.swarm.connect(nodeBMultiaddr, (err) => {
      expect(err).to.not.exist
      // So that identify has time to execute
      setTimeout(done, 500)
    })
  })

  it('libp2p.swarm.peers on nodeA and nodeB match each other', (done) => {
    parallel([
      (cb) => {
        nodeA.libp2p.swarm.peers((err, res) => {
          expect(err).to.not.exist
          expect(Object.keys(res)).to.have.length(1)
          cb()
        })
      },
      (cb) => {
        nodeB.libp2p.swarm.peers((err, res) => {
          expect(err).to.not.exist
          expect(Object.keys(res)).to.have.length(1)
          cb()
        })
      }
    ], done)
  })

  it('libp2p.swarm.localAddrs', (done) => {
    nodeB.libp2p.swarm.localAddrs((err, res) => {
      expect(err).to.not.exist
      expect(res.length).to.equal(2)
      done()
    })
  })

  it('libp2p.swarm.disconnect nodeB from nodeA', (done) => {
    nodeA.libp2p.swarm.disconnect(nodeBMultiaddr, (err) => {
      expect(err).to.not.exist
      // So that identify has time to execute
      setTimeout(check, 500)

      function check () {
        parallel([
          (cb) => {
            nodeA.libp2p.swarm.peers((err, res) => {
              expect(err).to.not.exist
              expect(Object.keys(res)).to.have.length(0)
              cb()
            })
          },
          (cb) => {
            nodeB.libp2p.swarm.peers((err, res) => {
              expect(err).to.not.exist
              expect(Object.keys(res)).to.have.length(0)
              cb()
            })
          }
        ], done)
      }
    })
  })

  it('stop', (done) => {
    parallel([
      nodeA.goOffline,
      nodeB.goOffline
    ], done)
  })
})
