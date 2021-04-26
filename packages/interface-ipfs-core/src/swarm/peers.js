/* eslint-env mocha */
'use strict'

const { Multiaddr } = require('multiaddr')
const CID = require('cids')
const delay = require('delay')
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const getIpfsOptions = require('../utils/ipfs-options-websockets-filter-all')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const ipfsOptions = getIpfsOptions()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.peers', function () {
    this.timeout(80 * 1000)

    let ipfsA
    let ipfsB

    before(async () => {
      ipfsA = (await common.spawn({ type: 'proc', ipfsOptions })).api
      ipfsB = (await common.spawn({ type: isWebWorker ? 'go' : undefined })).api
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
      expect(Multiaddr.isMultiaddr(peer.addr)).to.equal(true)
      expect(peer).to.have.a.property('peer').that.is.a('string')
      expect(CID.isCID(new CID(peer.peer))).to.equal(true)
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
      expect(Multiaddr.isMultiaddr(peer.addr)).to.equal(true)
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
      const nodeA = (await common.spawn({ type: 'proc', ipfsOptions })).api
      const nodeB = (await common.spawn({ type: isWebWorker ? 'go' : undefined })).api
      await nodeA.swarm.connect(nodeB.peerId.addresses[0])
      await delay(1000)
      const peersA = await nodeA.swarm.peers()
      const peersB = await nodeB.swarm.peers()
      expect(peersA).to.have.length(1)
      expect(peersB).to.have.length(1)
    })

    it('should list peers only once even if they have multiple addresses', async () => {
      // TODO: Change to port 0, needs: https://github.com/ipfs/interface-ipfs-core/issues/152
      const config = getConfig(isBrowser && common.opts.type !== 'go'
        ? [
            process.env.SIGNALA_SERVER,
            process.env.SIGNALB_SERVER
          ]
        : [
            '/ip4/127.0.0.1/tcp/26545/ws',
            '/ip4/127.0.0.1/tcp/26546/ws'
          ])

      const nodeA = (await common.spawn({
        // browser nodes have webrtc-star addresses which can't be dialled by go so make the other
        // peer a js-ipfs node to get a tcp address that can be dialled. Also, webworkers are not
        // diable so don't use a in-proc node for webworkers
        type: ((isBrowser && common.opts.type === 'go') || isWebWorker) ? 'js' : 'proc',
        ipfsOptions
      })).api
      const nodeB = (await common.spawn({
        type: isWebWorker ? 'go' : undefined,
        ipfsOptions: {
          config
        }
      })).api

      await nodeB.swarm.connect(nodeA.peerId.addresses[0])

      await delay(1000)
      const peersA = await nodeA.swarm.peers()
      const peersB = await nodeB.swarm.peers()
      expect(peersA).to.have.length(1)
      expect(peersB).to.have.length(1)
    })
  })
}
