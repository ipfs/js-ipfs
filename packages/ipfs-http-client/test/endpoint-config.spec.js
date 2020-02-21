/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const ipfsClient = require('../src')

describe('.getEndpointConfig', () => {
  it('should return the endpoint configuration', function () {
    const ipfs = ipfsClient('https://127.0.0.1:5501/ipfs/api/')
    const endpoint = ipfs.getEndpointConfig()

    expect(endpoint.host).to.equal('127.0.0.1')
    expect(endpoint.protocol).to.equal('https')
    expect(endpoint['api-path']).to.equal('/ipfs/api')
    expect(endpoint.port).to.equal('5501')
  })
})
