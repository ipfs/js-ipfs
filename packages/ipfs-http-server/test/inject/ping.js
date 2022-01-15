/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { testHttpMethod } from '../utils/test-http-method.js'
import { http } from '../utils/http.js'
import sinon from 'sinon'
import { allNdjson } from '../utils/all-ndjson.js'

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

  it('returns 400 if arg is not provided', async () => {
    const res = await http({
      method: 'POST',
      url: '/api/v0/ping?count=1'
    }, { ipfs })

    expect(res).to.have.property('statusCode', 400)
  })

  it('returns error for incorrect Peer Id', async () => {
    ipfs.ping.withArgs(peerId)
      .callsFake(async function * () { // eslint-disable-line require-yield
        throw new Error('derp')
      })

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
    }).callsFake(async function * () {})

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
    }).callsFake(async function * () {})

    const res = await http({
      method: 'POST',
      url: `/api/v0/ping?arg=${peerId}&n=5`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
  })

  it('pings a remote peer', async () => {
    ipfs.ping.withArgs(peerId, defaultOptions)
      .callsFake(async function * () {
        yield {
          success: true,
          time: 1,
          text: 'hello'
        }
        yield {
          success: true,
          time: 2,
          text: 'world'
        }
      })

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
    }).callsFake(async function * () {})

    const res = await http({
      method: 'POST',
      url: `/api/v0/ping?arg=${peerId}&timeout=1s`
    }, { ipfs })

    expect(res).to.have.property('statusCode', 200)
  })
})
