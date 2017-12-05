/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const multiaddr = require('multiaddr')
const os = require('os')
const path = require('path')
const hat = require('hat')

module.exports = (common) => {
  describe('.swarm', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB
    let factoryInstance

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(100 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factoryInstance = factory
        series([
          (cb) => factory.spawnNode((err, node) => {
            expect(err).to.not.exist()
            ipfsA = node
            cb()
          }),
          (cb) => factory.spawnNode((err, node) => {
            expect(err).to.not.exist()
            ipfsB = node
            cb()
          })
        ], done)
      })
    })

    after((done) => common.teardown(done))

    let ipfsBId

    describe('callback API', function () {
      this.timeout(80 * 1000)

      it('.connect', (done) => {
        ipfsB.id((err, id) => {
          expect(err).to.not.exist()
          ipfsBId = id
          const ipfsBAddr = id.addresses[0]
          ipfsA.swarm.connect(ipfsBAddr, done)
        })
      })

      // for Identify to finish
      it('time', (done) => setTimeout(done, 1500))

      describe('.peers', () => {
        beforeEach((done) => {
          const ipfsBAddr = ipfsBId.addresses[0]
          ipfsA.swarm.connect(ipfsBAddr, done)
        })

        it('default', (done) => {
          ipfsA.swarm.peers((err, peers) => {
            expect(err).to.not.exist()
            expect(peers).to.have.length.above(0)

            const peer = peers[0]

            expect(peer).to.have.a.property('addr')
            expect(multiaddr.isMultiaddr(peer.addr)).to.equal(true)
            expect(peer).to.have.a.property('peer')
            expect(peer).to.not.have.a.property('latency')

            // only available in 0.4.5
            // expect(peer).to.have.a.property('muxer')
            // expect(peer).to.not.have.a.property('streams')

            done()
          })
        })

        it('verbose', (done) => {
          ipfsA.swarm.peers({verbose: true}, (err, peers) => {
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

        describe('Shows connected peers only once', () => {
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

          it('Connecting two peers with one address each', (done) => {
            let nodeA
            let nodeB
            let nodeBAddress
            const addresses = ['/ip4/127.0.0.1/tcp/0']
            const config = getConfig(addresses)
            series([
              (cb) => {
                factoryInstance.spawnNode(getRepoPath(), config, (err, node) => {
                  expect(err).to.not.exist()
                  nodeA = node
                  cb()
                })
              },
              (cb) => {
                factoryInstance.spawnNode(getRepoPath(), config, (err, node) => {
                  expect(err).to.not.exist()
                  nodeB = node
                  cb()
                })
              },
              (cb) => {
                nodeB.id((err, info) => {
                  expect(err).to.not.exist()
                  nodeBAddress = info.addresses[0]
                  cb()
                })
              },
              (cb) => nodeA.swarm.connect(nodeBAddress, cb),
              (cb) => setTimeout(cb, 1000), // time for identify
              (cb) => {
                nodeA.swarm.peers((err, peers) => {
                  expect(err).to.not.exist()
                  expect(peers).to.have.length(1)
                  cb()
                })
              },
              (cb) => {
                nodeB.swarm.peers((err, peers) => {
                  expect(err).to.not.exist()
                  expect(peers).to.have.length(1)
                  cb()
                })
              }
            ], done)
          })

          it('Connecting two peers with two addresses each', (done) => {
            let nodeA
            let nodeB
            let nodeBAddress

            // TODO: Change to port 0, needs: https://github.com/ipfs/interface-ipfs-core/issues/152
            const configA = getConfig([
              '/ip4/127.0.0.1/tcp/16543',
              '/ip4/127.0.0.1/tcp/16544'
            ])
            const configB = getConfig([
              '/ip4/127.0.0.1/tcp/26545',
              '/ip4/127.0.0.1/tcp/26546'
            ])
            series([
              (cb) => {
                factoryInstance.spawnNode(getRepoPath(), configA, (err, node) => {
                  expect(err).to.not.exist()
                  nodeA = node
                  cb()
                })
              },
              (cb) => {
                factoryInstance.spawnNode(getRepoPath(), configB, (err, node) => {
                  expect(err).to.not.exist()
                  nodeB = node
                  cb()
                })
              },
              (cb) => {
                nodeB.id((err, info) => {
                  expect(err).to.not.exist()
                  nodeBAddress = info.addresses[0]
                  cb()
                })
              },
              (cb) => nodeA.swarm.connect(nodeBAddress, cb),
              (cb) => setTimeout(cb, 1000), // time for identify
              (cb) => {
                nodeA.swarm.peers((err, peers) => {
                  expect(err).to.not.exist()
                  expect(peers).to.have.length(1)
                  cb()
                })
              },
              (cb) => {
                nodeB.swarm.peers((err, peers) => {
                  expect(err).to.not.exist()
                  expect(peers).to.have.length(1)
                  cb()
                })
              }
            ], done)
          })
        })
      })

      it('.addrs', (done) => {
        ipfsA.swarm.addrs((err, multiaddrs) => {
          expect(err).to.not.exist()
          expect(multiaddrs).to.not.be.empty()
          expect(multiaddrs).to.be.an('array')
          expect(multiaddrs[0].constructor.name).to.be.eql('PeerInfo')
          done()
        })
      })

      it('.localAddrs', (done) => {
        ipfsA.swarm.localAddrs((err, multiaddrs) => {
          expect(err).to.not.exist()
          expect(multiaddrs).to.have.length.above(0)
          done()
        })
      })

      it('.disconnect', (done) => {
        ipfsB.id((err, id) => {
          expect(err).to.not.exist()
          const ipfsBAddr = id.addresses[0]
          ipfsA.swarm.disconnect(ipfsBAddr, done)
        })
      })
    })

    describe('promise API', function () {
      this.timeout(80 * 1000)

      it('.connect', () => {
        return ipfsB.id()
          .then((id) => {
            const ipfsBAddr = id.addresses[0]
            return ipfsA.swarm.connect(ipfsBAddr)
          })
      })

      // for Identify to finish
      it('time', (done) => {
        setTimeout(done, 1500)
      })

      it('.peers', () => {
        return ipfsA.swarm.peers().then((multiaddrs) => {
          expect(multiaddrs).to.have.length.above(0)
        })
      })

      it('.addrs', () => {
        return ipfsA.swarm.addrs().then((multiaddrs) => {
          expect(multiaddrs).to.have.length.above(0)
        })
      })

      it('.localAddrs', () => {
        return ipfsA.swarm.localAddrs().then((multiaddrs) => {
          expect(multiaddrs).to.have.length.above(0)
        })
      })

      it('.disconnect', () => {
        return ipfsB.id()
          .then((id) => {
            const ipfsBAddr = id.addresses[0]
            return ipfsA.swarm.disconnect(ipfsBAddr)
          })
      })
    })
  })
}
