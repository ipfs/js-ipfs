/* eslint-env mocha */

const expect = require('chai').expect

process.env.IPFS_PATH = process.cwd() + '/tests/repo-example'
const IPFS = require('../../src/core')

describe('swarm', () => {
  var ipfs

  before((done) => {
    ipfs = new IPFS()
    ipfs.load(done)
  })

  it('start', (done) => {
    ipfs.libp2p.start((err) => {
      expect(err).to.not.exist
      done()
    })
  })

  it.skip('swarm peers', (done) => {})
  it.skip('swarm connect', (done) => {})
  it.skip('swarm disconnect', (done) => {})

  it('stop', (done) => {
    ipfs.libp2p.stop((err) => {
      expect(err).to.not.exist
      done()
    })
  })
})
