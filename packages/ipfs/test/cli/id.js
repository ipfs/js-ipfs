/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const sinon = require('sinon')

describe('id', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      id: sinon.stub()
    }
  })

  it('should output json string', async () => {
    ipfs.id.resolves({
      id: 'id',
      publicKey: 'publicKey'
    })

    const out = await cli('id', { ipfs })
    const res = JSON.parse(out)
    expect(res).to.have.property('id', 'id')
    expect(res).to.have.property('publicKey', 'publicKey')
  })

  it('should output formatted string', async () => {
    ipfs.id.resolves({
      id: 'id',
      publicKey: 'publicKey'
    })

    const out = await cli('id --format "<id> <pubkey>"', { ipfs })
    expect(out).to.equal('id publicKey\n')
  })
})
