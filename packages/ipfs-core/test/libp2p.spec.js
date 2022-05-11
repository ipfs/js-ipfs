/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { MemoryDatastore } from 'datastore-core/memory'
// import { createLibp2p } from 'libp2p'
// import { EventEmitter } from 'events'
import { createLibp2p as libp2pComponent } from '../src/components/libp2p.js'
// import { NOISE as Crypto } from '@chainsafe/libp2p-noise'
import { GossipSub } from '@chainsafe/libp2p-gossipsub'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'

/**
 * @type {import('@libp2p/interfaces/transport').Transport}
 */

/*
class DummyTransport {
  get [Symbol.toStringTag] () {
    return 'DummyTransport'
  }

  filter () {
    return []
  }
}

class DummyDiscovery extends EventEmitter {
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
*/

describe('libp2p customization', function () {
  // Provide some extra time for ci since we're starting libp2p nodes in each test
  this.timeout(25 * 1000)

  /**
   * @type {import('interface-datastore').Datastore}
   */
  let datastore
  /**
   * @type {import('@libp2p/interfaces/peer-id').PeerId}
   */
  let peerId
  /**
   * @type {import('ipfs-core-types/src/config').Config}
   */
  let testConfig
  /**
   * @type {import('libp2p').Libp2p | null}
   */
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
    datastore = new MemoryDatastore()
    peerId = await createEd25519PeerId()
  })

  afterEach(async () => {
    if (libp2p) {
      await libp2p.stop()
      libp2p = null
    }
  })
  /*
  describe('bundle', () => {
    it('should allow for using a libp2p bundle', async () => {
      libp2p = await libp2pComponent({
        options: {
          libp2p: async (opts) => {
            return createLibp2p({
              peerId: opts.peerId,
              transports: [new DummyTransport()],
              connectionEncryption: [Crypto],
              relay: { enabled: false }
            })
          }
        },
        peerId,
        // @ts-expect-error repo is not complete implementation
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
      libp2p = await libp2pComponent({
        options: {
          libp2p: async (opts) => {
            return createLibp2p({
              peerId: opts.peerId,
              // @ts-expect-error DummyTransport is not complete implementation
              modules: { transport: [DummyTransport], connEncryption: [Crypto] },
              config: { relay: { enabled: false } }
            })
          }
        },
        peerId,
        // @ts-expect-error repo is not complete implementation
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
      libp2p = await libp2pComponent({
        peerId,
        // @ts-expect-error repo is not complete implementation
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
          }
        },
        pubsub: {
          enabled: true,
          emitSelf: true
        }
      })
      const transports = Array.from(libp2p.transportManager.getTransports())
      expect(transports).to.have.length(3)
    })

    it('should allow for overriding via options', async () => {
      const annAddr = '/dns4/test.ipfs.io/tcp/443/wss'

      libp2p = await libp2pComponent({
        peerId,
        // @ts-expect-error repo is not complete implementation
        repo: { datastore },
        print: console.log, // eslint-disable-line no-console
        config: testConfig,
        options: {
          libp2p: {
            transports: [new DummyTransport()],
            peerDiscovery: [new DummyDiscovery()],
            relay: { enabled: false },
            addresses: {
              announce: [annAddr]
            }
          }
        }
      })

      await libp2p.start()

      const transports = Array.from(libp2p.transportManager.getTransports())
      expect(transports).to.have.length(1)
      expect(transports[0] instanceof DummyTransport).to.be.true()

      const discoveries = Array.from(libp2p.discovery.values())
      expect(discoveries).to.have.length(1)
      expect(discoveries[0] instanceof DummyDiscovery).to.be.true()

      expect(libp2p.getMultiaddrs().map(m => m.toString())).to.include(annAddr)
    })
  })
*/
  describe('config', () => {
    it('should be able to specify Announce addresses', async () => {
      const annAddr = '/dns4/test.ipfs.io/tcp/443/wss'

      libp2p = await libp2pComponent({
        peerId,
        // @ts-expect-error repo is not complete implementation
        repo: { datastore },
        print: console.log, // eslint-disable-line no-console
        config: {
          ...testConfig,
          Addresses: {
            ...testConfig.Addresses,
            Announce: [annAddr]
          }
        }
      })

      await libp2p.start()

      expect(libp2p.getMultiaddrs().map(m => m.toString())).to.include(`${annAddr}/p2p/${peerId}`)
    })

    it('should select gossipsub as pubsub router', async () => {
      libp2p = await libp2pComponent({
        peerId,
        // @ts-expect-error repo is not complete implementation
        repo: { datastore },
        print: console.log, // eslint-disable-line no-console
        config: {
          ...testConfig,
          Pubsub: { PubSubRouter: 'gossipsub' }
        }
      })

      await libp2p.start()

      expect(libp2p.pubsub).to.be.an.instanceOf(GossipSub)
    })
  })
})
