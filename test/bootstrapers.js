/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const IPFS = require('..')
const list = require('../src/core/runtime/config-browser.json').Bootstrap

/*
 * These tests were graciously made for lgierth, so that he can test the
 * WebSockets Bootstrappers easily <3
 */
describe('Check that a js-ipfs node can indeed contact the bootstrappers', function () {
  this.timeout(60 * 1000)

  it('a node connects to bootstrapers', (done) => {
    const node = new IPFS({
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    node.on('ready', check)

    function check () {
      node.swarm.peers((err, peers) => {
        expect(err).to.not.exist()

        if (peers.length !== list.length) {
          return setTimeout(check, 2000)
        }

        const peerList = peers.map((peer) => peer.addr.toString())
        expect(peers.length).to.equal(list.length)
        expect(peerList).to.eql(list)

        node.stop(done)
      })
    }
  })
})
