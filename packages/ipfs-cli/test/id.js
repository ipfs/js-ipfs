/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('./utils/cli')
const sinon = require('sinon')
const PeerId = require('peer-id')

const defaultOptions = {
  timeout: undefined,
  peerId: undefined
}

describe('id', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      id: sinon.stub()
    }
  })

  it('should output json string', async () => {
    ipfs.id.withArgs(defaultOptions).resolves({
      id: 'id',
      publicKey: 'publicKey'
    })

    const out = await cli('id', { ipfs })
    const res = JSON.parse(out)
    expect(res).to.have.property('id', 'id')
    expect(res).to.have.property('publicKey', 'publicKey')
  })

  it('should output formatted string', async () => {
    ipfs.id.withArgs(defaultOptions).resolves({
      id: 'id',
      publicKey: 'publicKey'
    })

    const out = await cli('id --format "<id> <pubkey>"', { ipfs })
    expect(out).to.equal('id publicKey\n')
  })

  it('should output string with timeout', async () => {
    ipfs.id.withArgs({
      ...defaultOptions,
      timeout: 1000
    }).resolves({
      id: 'id',
      publicKey: 'publicKey'
    })

    const out = await cli('id --timeout=1s', { ipfs })
    const res = JSON.parse(out)
    expect(res).to.have.property('id', 'id')
    expect(res).to.have.property('publicKey', 'publicKey')
  })

  it('get the id of another peer', async () => {
    const peerId = PeerId.createFromB58String('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')

    ipfs.id.withArgs({
      ...defaultOptions,
      peerId: peerId.toString()
    }).resolves({
      id: 'id',
      publicKey: 'publicKey'
    })

    const out = await cli(`id ${peerId}`, { ipfs })
    const res = JSON.parse(out)
    expect(res).to.have.property('id', 'id')
    expect(res).to.have.property('publicKey', 'publicKey')
  })
})
