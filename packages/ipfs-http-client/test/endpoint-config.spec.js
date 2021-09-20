/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

import { expect } from 'aegir/utils/chai.js'
import { create as httpClient } from '../src/index.js'

describe('.getEndpointConfig', () => {
  it('should return the endpoint configuration', function () {
    const ipfs = httpClient('https://127.0.0.1:5501/ipfs/api/')
    const endpoint = ipfs.getEndpointConfig()

    expect(endpoint.host).to.equal('127.0.0.1')
    expect(endpoint.protocol).to.equal('https:')
    expect(endpoint.pathname).to.equal('/ipfs/api/')
    expect(endpoint.port).to.equal('5501')
  })
})
