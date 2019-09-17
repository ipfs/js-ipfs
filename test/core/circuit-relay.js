/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const waterfall = require('async/waterfall')
const multiaddr = require('multiaddr')
const crypto = require('crypto')
const IPFS = require('../../src')

const DaemonFactory = require('ipfsd-ctl')
const procDf = DaemonFactory.create({ type: 'proc', exec: IPFS })

const baseConf = {
  Bootstrap: [],
  Addresses: {
    API: '/ip4/0.0.0.0/tcp/0',
    Gateway: '/ip4/0.0.0.0/tcp/0'
  },
  Discovery: {
    MDNS: {
      Enabled:
        false
    }
  }
}

const setupInProcNode = async (addrs, hop) => {
  const ipfsd = await procDf.spawn({
    libp2p: {
      config: {
        relay: {
          enabled: true,
          hop: {
            enabled: hop
          }
        }
      }
    },
    config: Object.assign({}, baseConf, {
      Addresses: {
        Swarm: addrs
      }
    }),
    preload: { enabled: false }
  })
  const id = await ipfsd.api.id()

  return { ipfsd, addrs: id.addresses }
}

const wsAddr = (addrs) => addrs.map((a) => a.toString()).find((a) => a.includes('/ws'))
const tcpAddr = (addrs) => addrs.map((a) => a.toString()).find((a) => !a.includes('/ws'))

describe('circuit relay', () => {
  describe('A <-> R <-> B', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeAAddr
    let nodeB
    let nodeBAddr
    let nodeBCircuitAddr

    let relayNode

    let nodes
    before('create and connect', async () => {
      const res = await Promise.all([
        setupInProcNode([
          '/ip4/0.0.0.0/tcp/0',
          '/ip4/0.0.0.0/tcp/0/ws'
        ], true),
        setupInProcNode(['/ip4/0.0.0.0/tcp/0']),
        setupInProcNode(['/ip4/0.0.0.0/tcp/0/ws'])
      ])
      nodes = res.map((node) => node.ipfsd)

      relayNode = res[0].ipfsd

      nodeAAddr = tcpAddr(res[1].addrs)
      nodeA = res[1].ipfsd.api

      nodeBAddr = wsAddr(res[2].addrs)

      nodeB = res[2].ipfsd.api
      nodeBCircuitAddr = `/p2p-circuit/ipfs/${multiaddr(nodeBAddr).getPeerId()}`

      // ensure we have an address string
      expect(nodeAAddr).to.be.a('string')
      expect(nodeBAddr).to.be.a('string')
      expect(nodeBCircuitAddr).to.be.a('string')

      await relayNode.api.swarm.connect(nodeAAddr)
      await relayNode.api.swarm.connect(nodeBAddr)
      await new Promise(resolve => setTimeout(resolve, 1000))
      await nodeA.swarm.connect(nodeBCircuitAddr)
    })

    after(() => Promise.all(nodes.map((node) => node.stop())))

    it('should transfer', function (done) {
      const data = crypto.randomBytes(128)
      waterfall([
        (cb) => nodeA.add(data, cb),
        (res, cb) => nodeB.cat(res[0].hash, cb),
        (buffer, cb) => {
          expect(buffer).to.deep.equal(data)
          cb()
        }
      ], done)
    })
  })
})
