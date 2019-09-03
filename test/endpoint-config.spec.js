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

describe('.getEndpointConfig', () => {
  if (!isNode) { return }

  let ipfsd
  let ipfs

  before(async function () {
    this.timeout(20 * 1000) // slow CI

    ipfsd = await f.spawn({
      initOptions: {
        bits: 1024,
        profile: 'test'
      }
    })
    ipfs = ipfsClient(ipfsd.apiAddr)
  })

  after(async function () {
    this.timeout(10 * 1000)

    if (ipfsd) {
      await ipfsd.stop()
    }
  })

  it('should return the endpoint configuration', function () {
    const endpoint = ipfs.getEndpointConfig()

    expect(endpoint.host).to.equal('127.0.0.1')
    expect(endpoint.protocol).to.equal('http')
    expect(endpoint['api-path']).to.equal('/api/v0/')
    // changes per test run so we just assert it exists.
    expect(endpoint).to.have.property('port')
  })
})
