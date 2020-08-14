/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  signal: sinon.match.instanceOf(AbortSignal),
  timeout: undefined
}

describe('/id', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      id: sinon.stub()
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod('/api/v0/id')
  })

  it('get the id', async () => {
    ipfs.id.withArgs(defaultOptions).returns({
      id: 'id',
      publicKey: 'publicKey',
      addresses: 'addresses',
      agentVersion: 'agentVersion',
      protocolVersion: 'protocolVersion'
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/id'
    }, { ipfs })

    expect(res).to.have.nested.property('result.ID', 'id')
    expect(res).to.have.nested.property('result.PublicKey', 'publicKey')
    expect(res).to.have.nested.property('result.Addresses', 'addresses')
    expect(res).to.have.nested.property('result.AgentVersion', 'agentVersion')
    expect(res).to.have.nested.property('result.ProtocolVersion', 'protocolVersion')
  })

  it('accepts a timeout', async () => {
    ipfs.id.withArgs({
      ...defaultOptions,
      timeout: 1000
    }).returns({
      id: 'id',
      publicKey: 'publicKey',
      addresses: 'addresses',
      agentVersion: 'agentVersion',
      protocolVersion: 'protocolVersion'
    })

    const res = await http({
      method: 'POST',
      url: '/api/v0/id?timeout=1s'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
  })
})
