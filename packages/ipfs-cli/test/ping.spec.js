/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { cli } from './utils/cli.js'
import sinon from 'sinon'
import { peerIdFromString } from '@libp2p/peer-id'
import { matchPeerId } from './utils/match-peer-id.js'

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
    const peerId = peerIdFromString('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    const time = 10

    // https://github.com/libp2p/js-peer-id/issues/141
    ipfs.ping.withArgs(matchPeerId(peerId), defaultOptions).returns([{
      success: true,
      time
    }])

    const out = await cli(`ping ${peerId}`, { ipfs })
    expect(out).to.equal(`Pong received: time=${time} ms\n`)
  })

  it('ping host with -n option', async () => {
    const peerId = peerIdFromString('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    const time = 10

    // https://github.com/libp2p/js-peer-id/issues/141
    ipfs.ping.withArgs(matchPeerId(peerId), {
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
    const peerId = peerIdFromString('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    const time = 10

    // https://github.com/libp2p/js-peer-id/issues/141
    ipfs.ping.withArgs(matchPeerId(peerId), {
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
    const peerId = peerIdFromString('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
    const time = 10

    // https://github.com/libp2p/js-peer-id/issues/141
    ipfs.ping.withArgs(matchPeerId(peerId), {
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
