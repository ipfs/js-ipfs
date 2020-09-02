/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const concat = require('it-concat')
const randomBytes = require('iso-random-stream/src/random')
const factory = require('../utils/factory')

const df = factory()

const setupInProcNode = async (type = 'proc', hop) => {
  const ipfsd = await df.spawn({
    type,
    ipfsOptions: {
      config: {
        relay: {
          enabled: true,
          hop: {
            enabled: hop
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
    let nodeB
    let nodeBCircuitAddr

    let relayAddr

    before('create and connect', async () => {
      const res = await Promise.all([
        setupInProcNode('proc'),
        setupInProcNode('js', true),
        setupInProcNode('js')
      ])

      nodeA = res[0].ipfsd.api
      relayAddr = res[1].addrs[0]
      nodeB = res[2].ipfsd.api

      nodeBCircuitAddr = `${relayAddr}/p2p-circuit/p2p/${nodeB.peerId.id}`

      await nodeA.swarm.connect(relayAddr)
      await nodeB.swarm.connect(relayAddr)

      await nodeA.swarm.connect(nodeBCircuitAddr)
    })

    after(() => df.clean())

    it('should transfer via relay', async () => {
      const data = randomBytes(128)
      const res = await nodeA.add(data)
      const buffer = await concat(nodeB.cat(res.cid))
      expect(buffer.slice()).to.deep.equal(data)
    })
  })
})
