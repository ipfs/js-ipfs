/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const parallel = require('async/parallel')
const series = require('async/series')
const IPFS = require('../../../src/core')

const createTempRepo = require('../../utils/temp-repo')

const sigServer = require('libp2p-webrtc-star/src/sig-server')

/*
 * Note:
 * Do not run these tests with other nodes in the same host with MDNS enabled
 */

// This keeps getting better, really need to finish the
// improving init thing
function createNode (webrtcStar, mdns, callback) {
  const repo = createTempRepo()
  const node = new IPFS(repo)

  series([
    (cb) => node.init({ emptyRepo: true, bits: 1024 }, cb),
    (cb) => {
      repo.config.get((err, config) => {
        expect(err).to.not.exist

        config.Addresses = {
          Swarm: ['/ip4/127.0.0.1/tcp/0'],
          API: '',
          Gateway: ''
        }
        if (webrtcStar) {
          const peerIdStr = config.Identity.PeerID
          const wstarAddr = '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/33333/ws/ipfs/' + peerIdStr

          config.Addresses.Swarm.push(wstarAddr)
          config.Discovery.MDNS.Enabled = mdns
        }
        repo.config.set(config, cb)
      })
    },
    (cb) => node.load(cb)
  ], (err) => callback(err, node))
}

describe.only('discovery', () => {
  let nodeA // only mdns
  let nodeB // mdns + webrtc-star discovery
  let nodeC // mdns + webrtc-star discovery
  let nodeD // only webrtc-star discovery

  let ss

  before((done) => {
    parallel([
      (cb) => {
        sigServer.start({
          port: 33333
        }, (err, server) => {
          expect(err).to.not.exist
          ss = server
          cb()
        })
      },
      // create 4 nodesconst IPFS = require('../../src/core')

      (cb) => {
        createNode(false, true, (err, node) => {
          expect(err).to.not.exist
          nodeA = node
          cb()
        })
      },
      (cb) => {
        createNode(true, true, (err, node) => {
          expect(err).to.not.exist
          nodeB = node
          cb()
        })
      },
      (cb) => {
        createNode(true, true, (err, node) => {
          expect(err).to.not.exist
          nodeC = node
          cb()
        })
      },
      (cb) => {
        createNode(true, false, (err, node) => {
          expect(err).to.not.exist
          nodeD = node
          cb()
        })
      }

    ], done)
  })

  after((done) => {
    series([
      (cb) => nodeA.goOffline(cb),
      (cb) => nodeB.goOffline(cb),
      (cb) => nodeC.goOffline(cb),
      (cb) => nodeD.goOffline(cb),
      (cb) => ss.stop(cb)
    ], done)
  })

  it('boot nodeA', (done) => {
    nodeA.goOnline(done)
  })

  it('boot nodeB, verify that MDNS worked', (done) => {
    nodeB.goOnline(() => setTimeout(check, 40000))

    function check () {
      parallel([
        (cb) => {
          nodeA.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(1)
            cb()
          })
        },
        (cb) => {
          nodeB.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(1)
            cb()
          })
        }
      ], done)
    }
  })

  it('boot nodeC, verify that MDNS or webrtc-star worked without conflict', (done) => {
    nodeC.goOnline(() => setTimeout(check, 60000))

    function check () {
      parallel([
        (cb) => {
          nodeA.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(2)
            cb()
          })
        },
        (cb) => {
          nodeB.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(2)
            cb()
          })
        },
        (cb) => {
          nodeC.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(2)
            cb()
          })
        }
      ], done)
    }
  })

  it('boot nodeD, verify that MDNS or webrtc-star worked without conflict', (done) => {
    nodeD.goOnline(() => setTimeout(check, 60000))

    function check () {
      parallel([
        (cb) => {
          nodeA.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(2)
            cb()
          })
        },
        (cb) => {
          nodeB.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(3)
            cb()
          })
        },
        (cb) => {
          nodeC.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(3)
            cb()
          })
        },
        (cb) => {
          nodeD.swarm.peers((err, peers) => {
            expect(err).to.not.exist
            expect(peers.length).to.equal(2)
            cb()
          })
        }
      ], done)
    }
  })
})
