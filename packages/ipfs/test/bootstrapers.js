/* eslint-env mocha */
'use strict'

const IPFS = require('..')
const { createFactory } = require('ipfsd-ctl')
const bootstrapList = require('../src/core/runtime/config-browser.js')().Bootstrap
const waitFor = require('./utils/wait-for')

/*
 * These tests were graciously made for lgierth, so that he can test the
 * WebSockets Bootstrappers easily <3
 */
describe('Check that a js-ipfs node can indeed contact the bootstrappers', () => {
  let ipfsd
  let factory

  before(async function () {
    this.timeout(30 * 1000)

    factory = createFactory({
      type: 'proc',
      ipfsModule: IPFS,
      ipfsHttpModule: require('ipfs-http-client')
    })

    ipfsd = await factory.spawn({
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })
  })

  after(() => factory.clean())

  it('a node connects to bootstrappers', async function () {
    this.timeout(2 * 60 * 1000)

    const test = async () => {
      const peers = await ipfsd.api.swarm.peers()
      const peerList = peers.map((peer) => peer.addr.toString())

      if (peerList.length !== bootstrapList.length) {
        return false
      }

      return bootstrapList.every(addr => peerList.includes(addr))
    }

    await waitFor(test, { name: 'connect to all bootstrap nodes', timeout: 60 * 1000 })
  })
})
