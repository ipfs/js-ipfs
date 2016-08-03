/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

const IPFS = require('../../../src/core')

describe('version', () => {
  var ipfs

  before((done) => {
    ipfs = new IPFS(require('../../utils/repo-path'))
    ipfs.load(done)
  })

  it('get version', (done) => {
    ipfs.version((err, version) => {
      expect(err).to.not.exist
      expect(version).to.equal('0.14.1')
      done()
    })
  })
})
