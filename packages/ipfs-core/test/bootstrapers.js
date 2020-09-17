/* eslint-env mocha */
'use strict'

const IPFS = require('../src')
const bootstrapList = require('../src/runtime/config-browser.js')().Bootstrap
const waitFor = require('./utils/wait-for')

/*
 * These tests were graciously made for lgierth, so that he can test the
 * WebSockets Bootstrappers easily <3
 */
describe('Check that a js-ipfs node can indeed contact the bootstrappers', () => {
  let ipfs

  before(async function () {
    this.timeout(30 * 1000)

    ipfs = await IPFS.create()
  })

  after(() => ipfs.stop())

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
