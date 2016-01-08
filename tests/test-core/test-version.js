/* globals describe, it */

'use strict'

const expect = require('chai').expect

process.env.IPFS_PATH = process.cwd() + '/tests/repo-example'
const IPFS = require('../../src/ipfs-core')

describe('version', () => {
  it('get version', done => {
    let ipfs = new IPFS()
    ipfs.version((err, version) => {
      expect(err).to.not.exist
      expect(version).to.equal('0.4.0-dev')
      done()
    })
  })
})
