/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const MemoryStore = require('interface-datastore').MemoryDatastore
const PeerInfo = require('peer-info')
const Libp2p = require('libp2p')
const EE = require('events')
const libp2pComponent = require('../../src/core/components/libp2p')

class DummyTransport {
  get [Symbol.toStringTag] () {
    return 'DummyTransport'
  }

  filter () {
    return []
  }
}

class DummyDiscovery extends EE {
  get [Symbol.toStringTag] () {
    return 'DummyDiscovery'
  }

  start () {
    return Promise.resolve()
  }

  stop () {
    return Promise.resolve()
  }
}

describe('libp2p customization', function () {
  // Provide some extra time for ci since we're starting libp2p nodes in each test
  this.timeout(25 * 1000)

  let datastore
  let peerInfo
  let testConfig
  let libp2p

  before(async function () {
    this.timeout(25 * 1000)

    testConfig = {
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
      }
    }
    datastore = new MemoryStore()
    peerInfo = await PeerInfo.create()
  })

  afterEach(async () => {
    if (libp2p) {
      await libp2p.stop()
      libp2p = null
    }
  })

  describe('bundle', () => {
    it('should allow for using a libp2p bundle', async () => {
      libp2p = libp2pComponent({
        options: {
          libp2p: (opts) => {
            return new Libp2p({
              peerInfo: opts.peerInfo,
              modules: { transport: [DummyTransport] },
              config: { relay: { enabled: false } }
            })
          }
        },
        peerInfo,
        repo: { datastore },
        print: console.log, // eslint-disable-line no-console
        config: testConfig
      })

      await libp2p.start()

      expect(libp2p._config.peerDiscovery).to.eql({ autoDial: true })
      const transports = Array.from(libp2p.transportManager.getTransports())
      expect(transports).to.have.length(1)
    })

    it('should pass libp2p options to libp2p bundle function', async () => {
      libp2p = libp2pComponent({
        options: {
          libp2p: (opts) => {
            return new Libp2p({
              peerInfo: opts.peerInfo,
              modules: { transport: [DummyTransport] },
              config: { relay: { enabled: false } }
            })
          }
        },
        peerInfo,
        repo: { datastore },
        print: console.log, // eslint-disable-line no-console
        config: testConfig
      })

      await libp2p.start()

      expect(libp2p._config.peerDiscovery).to.eql({ autoDial: true })
      const transports = Array.from(libp2p.transportManager.getTransports())
      expect(transports[0] instanceof DummyTransport).to.equal(true)
    })
  })

  describe('options', () => {
    it('should use options by default', async () => {
      libp2p = libp2pComponent({
        peerInfo,
        repo: { datastore },
        print: console.log, // eslint-disable-line no-console
        config: testConfig
      })

      await libp2p.start()

      expect(libp2p._config).to.deep.include({
        peerDiscovery: {
          autoDial: true,
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
        pubsub: {
          enabled: true,
          emitSelf: true,
          signMessages: true,
          strictSigning: true
        }
      })
      const transports = Array.from(libp2p.transportManager.getTransports())
      expect(transports).to.have.length(3)
    })

    it('should allow for overriding via options', async () => {
      libp2p = libp2pComponent({
        peerInfo,
        repo: { datastore },
        print: console.log, // eslint-disable-line no-console
        config: testConfig,
        options: {
          libp2p: {
            modules: {
              transport: [DummyTransport],
              peerDiscovery: [DummyDiscovery]
            },
            config: { relay: { enabled: false } }
          }
        }
      })

      await libp2p.start()

      const transports = Array.from(libp2p.transportManager.getTransports())
      expect(transports).to.have.length(1)
      expect(transports[0] instanceof DummyTransport).to.be.true()

      const discoveries = Array.from(libp2p._discovery.values())
      expect(discoveries).to.have.length(1)
      expect(discoveries[0] instanceof DummyDiscovery).to.be.true()
    })
  })

  describe('config', () => {
    it('should select gossipsub as pubsub router', async () => {
      libp2p = libp2pComponent({
        peerInfo,
        repo: { datastore },
        print: console.log, // eslint-disable-line no-console
        config: {
          ...testConfig,
          Pubsub: { Router: 'gossipsub' }
        }
      })

      await libp2p.start()

      expect(libp2p._modules.pubsub).to.eql(require('libp2p-gossipsub'))
    })
  })
})
