/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { MemoryDatastore } from 'datastore-core/memory'
import { createLibp2p as libp2pComponent } from '../src/components/libp2p.js'
import { GossipSub } from '@chainsafe/libp2p-gossipsub'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'

/**
 * @type {import('@libp2p/interface-transport').Transport}
 */

describe('libp2p customization', function () {
  // Provide some extra time for ci since we're starting libp2p nodes in each test
  this.timeout(25 * 1000)

  /**
   * @type {import('interface-datastore').Datastore}
   */
  let datastore
  /**
   * @type {import('@libp2p/interface-peer-id').PeerId}
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
