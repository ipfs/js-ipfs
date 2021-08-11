/* eslint-env mocha */
'use strict'

const crypto = require('libp2p-crypto')
const isIPFS = require('is-ipfs')
const { CID } = require('multiformats/cid')
const { multiaddr } = require('multiaddr')
const PeerId = require('peer-id')
const { expect } = require('aegir/utils/chai')

const Ipfs = require('../src')

describe('exports', () => {
  it('should export the expected types and utilities', () => {
    expect(Ipfs.crypto).to.equal(crypto)
    expect(Ipfs.isIPFS).to.equal(isIPFS)
    expect(Ipfs.CID).to.equal(CID)
    expect(Ipfs.multiaddr).to.equal(multiaddr)
    expect(Ipfs.PeerId).to.equal(PeerId)
  })
})
