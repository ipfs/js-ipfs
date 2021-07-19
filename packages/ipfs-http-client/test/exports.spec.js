/* eslint-env mocha, browser */
'use strict'

const { CID } = require('multiformats/cid')
const { multiaddr } = require('multiaddr')
const { expect } = require('aegir/utils/chai')

const IpfsHttpClient = require('../')

describe('exports', () => {
  it('should export the expected types and utilities', () => {
    expect(IpfsHttpClient.CID).to.equal(CID)
    expect(IpfsHttpClient.multiaddr).to.equal(multiaddr)
  })
})
