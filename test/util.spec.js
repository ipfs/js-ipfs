/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')

const ipfsClient = require('../src')
const f = require('./utils/factory')

describe('.util', () => {
  if (!isNode) { return }

  let ipfsd
  let ipfs

  before(function (done) {
    this.timeout(20 * 1000) // slow CI

    f.spawn({ initOptions: { bits: 1024, profile: 'test' } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsClient(_ipfsd.apiAddr)
      done()
    })
  })

  after(function (done) {
    this.timeout(10 * 1000)
    if (!ipfsd) return done()
    ipfsd.stop(done)
  })

  describe('.getEndpointConfig', () => {
    it('should return the endpoint configuration', function () {
      const endpoint = ipfs.util.getEndpointConfig()

      expect(endpoint.host).to.equal('127.0.0.1')
      expect(endpoint.protocol).to.equal('http')
      expect(endpoint['api-path']).to.equal('/api/v0/')
      // changes per test run so we just assert it exists.
      expect(endpoint).to.have.property('port')
    })
  })

  describe('.crypto', () => {
    it('should contain the crypto primitives object', function () {
      const cripto = ipfs.util.crypto

      expect(cripto).to.exist()
    })
  })

  describe('.isIPFS', () => {
    it('should contain the isIPFS utilities object', function () {
      const isIPFS = ipfs.util.isIPFS

      expect(isIPFS).to.exist()
    })
  })
})
