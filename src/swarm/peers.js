/* eslint-env mocha */
'use strict'

const auto = require('async/auto')
const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const os = require('os')
const path = require('path')
const hat = require('hat')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.swarm.peers', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB
    let ipfsFactory

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(100 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        ipfsFactory = factory

        spawnNodesWithId(2, factory, (err, nodes) => {
          expect(err).to.not.exist()
          ipfsA = nodes[0]
          ipfsB = nodes[1]
          ipfsA.swarm.connect(ipfsB.peerId.addresses[0], done)
        })
      })
    })

    after((done) => common.teardown(done))

    it('should list peers this node is connected to', (done) => {
      ipfsA.swarm.peers((err, peers) => {
        expect(err).to.not.exist()
        expect(peers).to.have.length.above(0)

        const peer = peers[0]

        expect(peer).to.have.a.property('addr')
        expect(multiaddr.isMultiaddr(peer.addr)).to.equal(true)
        expect(peer).to.have.a.property('peer')
        expect(PeerId.isPeerId(peer.peer)).to.equal(true)
        expect(peer).to.not.have.a.property('latency')

        // only available in 0.4.5
        // expect(peer).to.have.a.property('muxer')
        // expect(peer).to.not.have.a.property('streams')

        done()
      })
    })

    it('should list peers this node is connected to (promised)', () => {
      return ipfsA.swarm.peers().then((peers) => {
        expect(peers).to.have.length.above(0)

        const peer = peers[0]

        expect(peer).to.have.a.property('addr')
        expect(multiaddr.isMultiaddr(peer.addr)).to.equal(true)
        expect(peer).to.have.a.property('peer')
        expect(PeerId.isPeerId(peer.peer)).to.equal(true)
        expect(peer).to.not.have.a.property('latency')

        // only available in 0.4.5
        // expect(peer).to.have.a.property('muxer')
        // expect(peer).to.not.have.a.property('streams')
      })
    })

    it('should list peers this node is connected to with verbose option', (done) => {
      ipfsA.swarm.peers({ verbose: true }, (err, peers) => {
        expect(err).to.not.exist()
        expect(peers).to.have.length.above(0)

        const peer = peers[0]
        expect(peer).to.have.a.property('addr')
        expect(multiaddr.isMultiaddr(peer.addr)).to.equal(true)
        expect(peer).to.have.a.property('peer')
        expect(peer).to.have.a.property('latency')

        // Only available in 0.4.5
        // expect(peer).to.have.a.property('muxer')
        // expect(peer).to.have.a.property('streams')

        done()
      })
    })

    function getConfig (addrs) {
      addrs = Array.isArray(addrs) ? addrs : [addrs]

      return {
        Addresses: {
          Swarm: addrs,
          API: '/ip4/127.0.0.1/tcp/0',
          Gateway: '/ip4/127.0.0.1/tcp/0'
        },
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          }
        }
      }
    }

    function getRepoPath () {
      return path.join(os.tmpdir(), '.ipfs-' + hat())
    }

    it('should list peers only once', (done) => {
      const config = getConfig(['/ip4/127.0.0.1/tcp/0'])

      auto({
        nodeA: (cb) => ipfsFactory.spawnNode(getRepoPath(), config, cb),
        nodeB: ['nodeA', (_, cb) => {
          ipfsFactory.spawnNode(getRepoPath(), config, cb)
        }],
        nodeBAddress: ['nodeB', (res, cb) => {
          res.nodeB.id((err, info) => {
            if (err) return cb(err)
            cb(null, info.addresses[0])
          })
        }],
        connectA2B: ['nodeA', 'nodeBAddress', (res, cb) => {
          res.nodeA.swarm.connect(res.nodeBAddress, cb)
        }],
        // time for identify
        wait: ['connectA2B', (_, cb) => setTimeout(cb, 1000)],
        nodeAPeers: ['nodeA', 'wait', (res, cb) => {
          res.nodeA.swarm.peers(cb)
        }],
        nodeBPeers: ['nodeB', 'wait', (res, cb) => {
          res.nodeB.swarm.peers(cb)
        }]
      }, (err, res) => {
        expect(err).to.not.exist()
        expect(res.nodeAPeers).to.have.length(1)
        expect(res.nodeBPeers).to.have.length(1)
        done()
      })
    })

    it('should list peers only once even if they have multiple addresses', (done) => {
      // TODO: Change to port 0, needs: https://github.com/ipfs/interface-ipfs-core/issues/152
      const configA = getConfig([
        '/ip4/127.0.0.1/tcp/16543',
        '/ip4/127.0.0.1/tcp/16544'
      ])
      const configB = getConfig([
        '/ip4/127.0.0.1/tcp/26545',
        '/ip4/127.0.0.1/tcp/26546'
      ])

      auto({
        nodeA: (cb) => ipfsFactory.spawnNode(getRepoPath(), configA, cb),
        nodeB: ['nodeA', (_, cb) => {
          ipfsFactory.spawnNode(getRepoPath(), configB, cb)
        }],
        nodeBAddress: ['nodeB', (res, cb) => {
          res.nodeB.id((err, info) => {
            if (err) return cb(err)
            cb(null, info.addresses[0])
          })
        }],
        connectA2B: ['nodeA', 'nodeBAddress', (res, cb) => {
          res.nodeA.swarm.connect(res.nodeBAddress, cb)
        }],
        // time for identify
        wait: ['connectA2B', (_, cb) => setTimeout(cb, 1000)],
        nodeAPeers: ['nodeA', 'wait', (res, cb) => {
          res.nodeA.swarm.peers(cb)
        }],
        nodeBPeers: ['nodeB', 'wait', (res, cb) => {
          res.nodeB.swarm.peers(cb)
        }]
      }, (err, res) => {
        expect(err).to.not.exist()
        expect(res.nodeAPeers).to.have.length(1)
        expect(res.nodeBPeers).to.have.length(1)
        done()
      })
    })
  })
}
