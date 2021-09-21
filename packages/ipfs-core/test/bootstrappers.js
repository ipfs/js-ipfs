/* eslint-env mocha */

import createConfig from 'ipfs-core-config/config'
import { waitFor } from './utils/wait-for.js'
import createNode from './utils/create-node.js'

const { Bootstrap: bootstrapList } = createConfig()

/*
 * These tests were graciously made for lgierth, so that he can test the
 * WebSockets Bootstrappers easily <3
 */
describe('Check that a js-ipfs node can indeed contact the bootstrappers', () => {
  /** @type {import('ipfs-core-types').IPFS} */
  let ipfs
  /** @type {() => Promise<void>} */
  let cleanup

  before(async () => {
    const res = await createNode({
      config: {
        Bootstrap: bootstrapList
      }
    })
    ipfs = res.ipfs
    cleanup = res.cleanup
  })

  after(() => cleanup())

  it('a node connects to bootstrappers', async function () {
    this.timeout(2 * 60 * 1000)

    const test = async () => {
      const peers = await ipfs.swarm.peers()
      const peerList = peers.map((peer) => peer.addr.toString())

      if (peerList.length !== bootstrapList.length) {
        return false
      }

      return bootstrapList.every(addr => peerList.includes(addr))
    }

    await waitFor(test, { name: 'connect to all bootstrap nodes', timeout: 60 * 1000 })
  })
})
