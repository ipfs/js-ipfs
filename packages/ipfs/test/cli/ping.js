/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const sinon = require('sinon')

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
    const peerId = 'peer-id'
    const time = 10

    ipfs.ping.withArgs(peerId, defaultOptions).returns([{
      success: true,
      time
    }])

    const out = await cli(`ping ${peerId}`, { ipfs })
    expect(out).to.equal(`Pong received: time=${time} ms\n`)
  })

  it('ping host with --n option', async () => {
    const peerId = 'peer-id'
    const time = 10

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
    const peerId = 'peer-id'
    const time = 10

    ipfs.ping.withArgs(peerId, {
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
    const peerId = 'peer-id'
    const time = 10

    ipfs.ping.withArgs(peerId, {
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
