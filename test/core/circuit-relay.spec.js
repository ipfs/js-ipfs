/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const waterfall = require('async/waterfall')
const multiaddr = require('multiaddr')
const crypto = require('crypto')
const factory = require('../utils/factory')

const df = factory()

const setupInProcNode = async (type = 'proc', hop) => {
  const ipfsd = await df.spawn({
    type,
    ipfsOptions: {
      libp2p: {
        config: {
          relay: {
            enabled: true,
            hop: {
              enabled: hop
            }
          }
        }
      }
    }
  })
  const id = await ipfsd.api.id()

  return { ipfsd, addrs: id.addresses }
}

describe('circuit relay', () => {
  describe('A <-> R <-> B', function () {
    this.timeout(80 * 1000)

    let nodeA
    let nodeAAddr
    let nodeB
    let nodeBAddr
    let nodeBCircuitAddr

    let relayNode

    before('create and connect', async () => {
      const res = await Promise.all([
        setupInProcNode('proc', true),
        setupInProcNode('js'),
        setupInProcNode('js')
      ])

      relayNode = res[0].ipfsd

      nodeAAddr = res[1].addrs[0]
      nodeA = res[1].ipfsd.api

      nodeBAddr = res[2].addrs[0]

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

    after(() => df.clean())

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
