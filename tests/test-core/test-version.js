/* globals describe, it */

var expect = require('chai').expect

process.env.IPFS_PATH = process.cwd() + '/tests/repo-example'
var IPFS = require('../../src/ipfs-core')

describe('core: version', function () {
  it('get version', function (done) {
    var ipfs = new IPFS()
    ipfs.version(function (err, version) {
      expect(err).to.not.exist
      expect(version).to.equal('0.4.0-dev')
      done()
    })
  })
})
