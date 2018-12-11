/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const MemoryStore = require('interface-datastore').MemoryDatastore
const PeerInfo = require('peer-info')
const PeerBook = require('peer-book')
const WebSocketStar = require('libp2p-websocket-star')
const Multiplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const Libp2p = require('libp2p')

const libp2pComponent = require('../../src/core/components/libp2p')

describe('libp2p customization', function () {
  // Provide some extra time for ci since we're starting libp2p nodes in each test
  this.timeout(25 * 1000)

  let datastore
  let peerInfo
  let peerBook
  let mockConfig
  let _libp2p

  before(function (done) {
    this.timeout(25 * 1000)

    mockConfig = {
      get: (callback) => {
        callback(null, {
          Addresses: {
            Swarm: ['/ip4/0.0.0.0/tcp/4002'],
            API: '/ip4/127.0.0.1/tcp/5002',
            Gateway: '/ip4/127.0.0.1/tcp/9090'
          },
          Discovery: {
            MDNS: {
              Enabled: false
            },
            webRTCStar: {
              Enabled: false
            }
          },
          EXPERIMENTAL: {
            dht: false,
            pubsub: false
          }
        })
      }
    }
    datastore = new MemoryStore()
    peerBook = new PeerBook()
    PeerInfo.create((err, pi) => {
      peerInfo = pi
      done(err)
    })
  })

  afterEach((done) => {
    if (!_libp2p) return done()

    _libp2p.stop(() => {
      _libp2p = null
      done()
    })
  })

  describe('bundle', () => {
    it('should allow for using a libp2p bundle', (done) => {
      const ipfs = {
        _repo: {
          datastore
        },
        _peerInfo: peerInfo,
        _peerBook: peerBook,
        _print: console.log,
        config: mockConfig,
        _options: {
          libp2p: (opts) => {
            const wsstar = new WebSocketStar({ id: opts.peerInfo.id })

            return new Libp2p({
              peerInfo: opts.peerInfo,
              peerBook: opts.peerBook,
              modules: {
                transport: [
                  wsstar
                ],
                streamMuxer: [
                  Multiplex
                ],
                connEncryption: [
                  SECIO
                ],
                peerDiscovery: [
                  wsstar.discovery
                ]
              }
            })
          }
        }
      }

      _libp2p = libp2pComponent(ipfs)

      _libp2p.start((err) => {
        expect(err).to.not.exist()
        expect(ipfs._libp2pNode._config).to.not.have.property('peerDiscovery')
        expect(ipfs._libp2pNode._transport).to.have.length(1)
        done()
      })
    })
  })

  describe('options', () => {
    it('should use options by default', (done) => {
      const ipfs = {
        _repo: {
          datastore
        },
        _peerInfo: peerInfo,
        _peerBook: peerBook,
        _print: console.log,
        config: mockConfig
      }

      _libp2p = libp2pComponent(ipfs)

      _libp2p.start((err) => {
        expect(err).to.not.exist()
        expect(ipfs._libp2pNode._config).to.deep.include({
          peerDiscovery: {
            bootstrap: {
              enabled: true,
              list: []
            },
            mdns: {
              enabled: false
            },
            webRTCStar: {
              enabled: false
            },
            websocketStar: {
              enabled: true
            }
          },
          EXPERIMENTAL: {
            dht: true,
            pubsub: false
          }
        })
        expect(ipfs._libp2pNode._transport).to.have.length(3)
        done()
      })
    })

    it('should allow for overriding via options', (done) => {
      const wsstar = new WebSocketStar({ id: peerInfo.id })

      const ipfs = {
        _repo: {
          datastore
        },
        _peerInfo: peerInfo,
        _peerBook: peerBook,
        _print: console.log,
        config: mockConfig,
        _options: {
          config: {
            Discovery: {
              MDNS: {
                Enabled: true
              }
            }
          },
          EXPERIMENTAL: {
            dht: false,
            pubsub: true
          },
          libp2p: {
            modules: {
              transport: [
                wsstar
              ],
              peerDiscovery: [
                wsstar.discovery
              ]
            }
          }
        }
      }

      _libp2p = libp2pComponent(ipfs)

      _libp2p.start((err) => {
        expect(err).to.not.exist()
        expect(ipfs._libp2pNode._config).to.deep.include({
          peerDiscovery: {
            bootstrap: {
              enabled: true,
              list: []
            },
            mdns: {
              enabled: true
            },
            webRTCStar: {
              enabled: false
            },
            websocketStar: {
              enabled: true
            }
          },
          EXPERIMENTAL: {
            dht: true,
            pubsub: true
          }
        })
        expect(ipfs._libp2pNode._transport).to.have.length(1)
        done()
      })
    })
  })
})
