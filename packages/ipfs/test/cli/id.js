/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const sinon = require('sinon')

const defaultOptions = {
  timeout: undefined
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
})
