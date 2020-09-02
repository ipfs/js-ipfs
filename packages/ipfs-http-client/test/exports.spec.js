/* eslint-env mocha, browser */
'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihash = require('multihashes')
const { expect } = require('aegir/utils/chai')

const IpfsHttpClient = require('../')

describe('exports', () => {
  it('should export the expected types and utilities', () => {
    expect(IpfsHttpClient.CID).to.equal(CID)
    expect(IpfsHttpClient.multiaddr).to.equal(multiaddr)
    expect(IpfsHttpClient.multibase).to.equal(multibase)
    expect(IpfsHttpClient.multicodec).to.equal(multicodec)
    expect(IpfsHttpClient.multihash).to.equal(multihash)
  })
})
