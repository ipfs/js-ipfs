/* eslint-env mocha */

const expect = require('chai').expect

process.env.IPFS_PATH = process.cwd() + '/tests/repo-example'
const IPFS = require('../../src/core')

describe('version', () => {
  var ipfs

  before((done) => {
    ipfs = new IPFS()
    ipfs.load(done)
  })

  it('get version', (done) => {
    ipfs.version((err, version) => {
      expect(err).to.not.exist
      expect(version).to.equal('0.4.0-dev')
      done()
    })
  })
})
