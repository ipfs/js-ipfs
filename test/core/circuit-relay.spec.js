/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const all = require('it-all')
const concat = require('it-concat')
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
    let relayAddr

    before('create and connect', async () => {
      const res = await Promise.all([
        setupInProcNode('proc', true),
        setupInProcNode('js'),
        setupInProcNode('js')
      ])

      relayNode = res[0].ipfsd
      relayAddr = `${res[0].addrs[0]}/p2p/${relayNode.api.peerId.id}`

      nodeAAddr = res[1].addrs[0]
      nodeA = res[1].ipfsd.api

      nodeBAddr = res[2].addrs[0]

      nodeB = res[2].ipfsd.api
      nodeBCircuitAddr = `${relayAddr}/p2p-circuit/p2p/${nodeB.peerId.id}`

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

    it('should transfer via relay', async () => {
      const data = crypto.randomBytes(128)
      const res = await all(nodeA.add(data))
      const buffer = await concat(nodeB.cat(res[0].cid))
      expect(buffer.slice()).to.deep.equal(data)
    })
  })
})
