/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const testHttpMethod = require('../../utils/test-http-method')
const http = require('../../utils/http')
const sinon = require('sinon')
const allNdjson = require('../../utils/all-ndjson')
const { AbortSignal } = require('abort-controller')

const defaultOptions = {
  count: 10,
  signal: sinon.match.instanceOf(AbortSignal),
  timeout: undefined
}

describe('/ping', function () {
  const peerId = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'
  let ipfs

  beforeEach(() => {
    ipfs = {
      ping: sinon.stub()
    }
  })

  it('only accepts POST', () => {
    return testHttpMethod('/api/v0/ping')
  })

  it('returns 400 if both n and count are provided', async () => {
    const res = await http({
      method: 'POST',
      url: '/api/v0/ping?arg=peerid&n=1&count=1'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 400)
  })

  it('returns 400 if arg is not provided', async () => {
    const res = await http({
      method: 'POST',
      url: '/api/v0/ping?count=1'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 400)
  })

  it('returns 500 for incorrect Peer Id', async () => {
    ipfs.ping.withArgs(peerId).throws(new Error('derp'))

    const res = await http({
      method: 'POST',
      url: `/api/v0/ping?arg=${peerId}`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 500)
  })

  it('pings with a count', async () => {
    ipfs.ping.withArgs(peerId, {
      ...defaultOptions,
      count: 5
    }).returns([])

    const res = await http({
      method: 'POST',
      url: `/api/v0/ping?arg=${peerId}&count=5`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
  })

  it('pings with a count as n', async () => {
    ipfs.ping.withArgs(peerId, {
      ...defaultOptions,
      count: 5
    }).returns([])

    const res = await http({
      method: 'POST',
      url: `/api/v0/ping?arg=${peerId}&n=5`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
  })

  it('pings a remote peer', async () => {
    ipfs.ping.withArgs(peerId, defaultOptions).returns([{
      success: true,
      time: 1,
      text: 'hello'
    }, {
      success: true,
      time: 2,
      text: 'world'
    }])

    const res = await http({
      method: 'POST',
      url: `/api/v0/ping?arg=${peerId}`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
    expect(allNdjson(res)).to.deep.equal([{
      Success: true,
      Time: 1,
      Text: 'hello'
    }, {
      Success: true,
      Time: 2,
      Text: 'world'
    }])
  })

  it('accepts a timeout', async () => {
    ipfs.ping.withArgs(peerId, {
      ...defaultOptions,
      timeout: 1000
    }).returns([])

    const res = await http({
      method: 'POST',
      url: `/api/v0/ping?arg=${peerId}&timeout=1s`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
  })
})
