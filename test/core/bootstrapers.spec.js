/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const IPFS = require('../..')

/*
 * These tests were graciously made for lgierth, so that he can test
 * the WebSockets Bootstrappers easily :)
 */
console.log('=>', process.env.TEST_BOOTSTRAPERS)
if (process.env.TEST_BOOTSTRAPERS) {
  describe.only('Check if a connection can be done to the Bootstrapers', () => {
    it('a node connects to bootstrapers', (done) => {
      const node = new IPFS()
      node.on('ready', () => {
        setTimeout(() => {
          node.swarm.peers((err, peers) => {
            expect(err).to.not.exist()
            expect(peers.length).to.be.above(7)
            node.stop(done)
          })
        }, 1000)
      })
    })

    it.skip('bootstrapers connections hold for more than 10 secs', (done) => {})
    it.skip('fetch a file added in this node, from bootstrapers', (done) => {})
  })
}
