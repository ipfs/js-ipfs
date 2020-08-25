/* eslint-env mocha */
'use strict'

const crypto = require('libp2p-crypto')
const isIPFS = require('is-ipfs')
const CID = require('cids')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multihashing = require('multihashing-async')
const multihash = multihashing.multihash
const multicodec = require('multicodec')
const PeerId = require('peer-id')
const { expect } = require('aegir/utils/chai')

const Ipfs = require('../../')

describe('exports', () => {
  it('should export the expected types and utilities', () => {
    expect(Ipfs.crypto).to.equal(crypto)
    expect(Ipfs.isIPFS).to.equal(isIPFS)
    expect(Ipfs.CID).to.equal(CID)
    expect(Ipfs.multiaddr).to.equal(multiaddr)
    expect(Ipfs.multibase).to.equal(multibase)
    expect(Ipfs.multihash).to.equal(multihash)
    expect(Ipfs.multihashing).to.equal(multihashing)
    expect(Ipfs.multicodec).to.equal(multicodec)
    expect(Ipfs.PeerId).to.equal(PeerId)
  })
})
