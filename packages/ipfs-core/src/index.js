'use strict'

const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')
const PeerId = require('peer-id')
const crypto = require('libp2p-crypto')
const isIPFS = require('is-ipfs')
const { multiaddr } = require('multiaddr')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihashing = require('multihashing-async')
const multihash = multihashing.multihash
const CID = require('cids')
const { create } = require('./components')

/**
 * @typedef {import('./components')} IPFS
 * @typedef {import('./types').Options} Options
 */

module.exports = {
  create,
  crypto,
  isIPFS,
  CID,
  multiaddr,
  multibase,
  multihash,
  multihashing,
  multicodec,
  PeerId,
  globSource,
  urlSource
}
