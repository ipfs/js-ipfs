/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import sinon from 'sinon'

const defaultOptions = {
  signal: sinon.match.instanceOf(AbortSignal),
  timeout: undefined,
  peerId: undefined
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

  it('get the id of another peer', async () => {
    const peerId = 'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'

    ipfs.id.withArgs({
      ...defaultOptions,
      peerId
    }).returns({
      id: 'id',
      publicKey: 'publicKey',
      addresses: 'addresses',
      agentVersion: 'agentVersion',
      protocolVersion: 'protocolVersion'
    })

    const res = await http({
      method: 'POST',
      url: `/api/v0/id?peerId=${peerId}`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
  })
})
