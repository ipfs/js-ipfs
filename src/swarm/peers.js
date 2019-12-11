/* eslint-env mocha */
'use strict'

const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const delay = require('delay')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.peers', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = (await common.spawn()).api
      ipfsB = (await common.spawn({ type: 'go' })).api
      await ipfsA.swarm.connect(ipfsB.peerId.addresses[0])
      /* TODO: Seen if we still need this after this is fixed
         https://github.com/ipfs/js-ipfs/issues/2601 gets resolved */
      // await delay(60 * 1000) // wait for open streams in the connection available
    })

    after(() => common.clean())

    it('should list peers this node is connected to', async () => {
      const peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length.above(0)

      const peer = peers[0]

      expect(peer).to.have.a.property('addr')
      expect(multiaddr.isMultiaddr(peer.addr)).to.equal(true)
      expect(peer).to.have.a.property('peer')
      expect(PeerId.isPeerId(peer.peer)).to.equal(true)
      expect(peer).to.not.have.a.property('latency')

      /* TODO: These assertions must be uncommented as soon as
         https://github.com/ipfs/js-ipfs/issues/2601 gets resolved */
      // expect(peer).to.have.a.property('muxer')
      // expect(peer).to.not.have.a.property('streams')
    })

    it('should list peers this node is connected to with verbose option', async () => {
      const peers = await ipfsA.swarm.peers({ verbose: true })
      expect(peers).to.have.length.above(0)

      const peer = peers[0]
      expect(peer).to.have.a.property('addr')
      expect(multiaddr.isMultiaddr(peer.addr)).to.equal(true)
      expect(peer).to.have.a.property('peer')
      expect(peer).to.have.a.property('latency')
      expect(peer.latency).to.match(/n\/a|[0-9]+[mµ]?s/) // n/a or 3ms or 3µs or 3s

      /* TODO: These assertions must be uncommented as soon as
         https://github.com/ipfs/js-ipfs/issues/2601 gets resolved */
      // expect(peer).to.have.a.property('muxer')
      // expect(peer).to.have.a.property('streams')
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

    it('should list peers only once', async () => {
      const nodeA = (await common.spawn()).api
      const nodeB = (await common.spawn({ type: 'go' })).api
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
      await delay(1000)
      const peersA = await nodeA.swarm.peers()
      const peersB = await nodeB.swarm.peers()
      expect(peersA).to.have.length(1)
      expect(peersB).to.have.length(1)
    })

    it('should list peers only once even if they have multiple addresses', async () => {
      // TODO: Change to port 0, needs: https://github.com/ipfs/interface-ipfs-core/issues/152
      const configA = getConfig([
        '/ip4/127.0.0.1/tcp/16543',
        '/ip4/127.0.0.1/tcp/16544'
      ])
      const configB = getConfig([
        '/ip4/127.0.0.1/tcp/26545/ws',
        '/ip4/127.0.0.1/tcp/26546/ws'
      ])
      const nodeA = (await common.spawn({ ipfsOptions: { config: configA } })).api
      const nodeB = (await common.spawn({ type: 'js', ipfsOptions: { config: configB } })).api
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
      await delay(1000)
      const peersA = await nodeA.swarm.peers()
      const peersB = await nodeB.swarm.peers()
      expect(peersA).to.have.length(1)
      expect(peersB).to.have.length(1)
    })
  })
}
