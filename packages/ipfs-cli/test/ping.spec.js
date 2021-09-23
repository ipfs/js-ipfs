/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import sinon from 'sinon'

const defaultOptions = {
  count: 10,
  timeout: undefined
}

describe('ping', function () {
  let ipfs

  beforeEach(() => {
    ipfs = {
      ping: sinon.stub()
    }
  })

  it('ping host', async () => {
    const peerId = 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
    const time = 10

    // https://github.com/libp2p/js-peer-id/issues/141
    ipfs.ping.withArgs(peerId, defaultOptions).returns([{
      success: true,
      time
    }])

    const out = await cli(`ping ${peerId}`, { ipfs })
    expect(out).to.equal(`Pong received: time=${time} ms\n`)
  })

  it('ping host with --n option', async () => {
    const peerId = 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
    const time = 10

    // https://github.com/libp2p/js-peer-id/issues/141
    ipfs.ping.withArgs(peerId, {
      ...defaultOptions,
      count: 1
    }).returns([{
      success: true,
      time
    }])

    const out = await cli(`ping -n 1 ${peerId}`, { ipfs })
    expect(out).to.equal(`Pong received: time=${time} ms\n`)
  })

  it('ping host with --count option', async () => {
    const peerId = 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
    const time = 10

    // https://github.com/libp2p/js-peer-id/issues/141
    ipfs.ping.withArgs(peerId.toString(), {
      ...defaultOptions,
      count: 1
    }).returns([{
      success: true,
      time
    }])

    const out = await cli(`ping --count 1 ${peerId}`, { ipfs })
    expect(out).to.equal(`Pong received: time=${time} ms\n`)
  })

  it('ping host with timeout', async () => {
    const peerId = 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'
    const time = 10

    // https://github.com/libp2p/js-peer-id/issues/141
    ipfs.ping.withArgs(peerId.toString(), {
      ...defaultOptions,
      timeout: 1000
    }).returns([{
      success: true,
      time
    }])

    const out = await cli(`ping --timeout=1s ${peerId}`, { ipfs })
    expect(out).to.equal(`Pong received: time=${time} ms\n`)
  })
})
