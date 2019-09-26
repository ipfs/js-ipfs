/* eslint-env mocha */
'use strict'

const IPFS = require('..')
const IPFSFactory = require('ipfsd-ctl')
const bootstrapList = require('../src/core/runtime/config-browser.js')().Bootstrap
const waitFor = require('./utils/wait-for')

/*
 * These tests were graciously made for lgierth, so that he can test the
 * WebSockets Bootstrappers easily <3
 */
describe('Check that a js-ipfs node can indeed contact the bootstrappers', () => {
  let ipfsd

  before(async () => {
    this.timeout(30 * 1000)

    const factory = IPFSFactory.create({
      type: 'proc',
      exec: IPFS,
      IpfsClient: require('ipfs-http-client')
    })

    ipfsd = await factory.spawn({
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })
  })

  after(() => ipfsd.stop())

  it('a node connects to bootstrappers', function (done) {
    this.timeout(2 * 60 * 1000)

    const test = (cb) => {
      ipfsd.api.swarm.peers((err, peers) => {
        if (err) return cb(err)

        const peerList = peers.map((peer) => peer.addr.toString())

        if (peerList.length !== bootstrapList.length) {
          return cb(null, false)
        }

        cb(null, bootstrapList.every(addr => peerList.includes(addr)))
      })
    }

    waitFor(test, { name: 'connect to all bootstrap nodes', timeout: 60 * 1000 }, done)
  })
})
