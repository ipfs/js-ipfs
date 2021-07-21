'use strict'

const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')
const PeerId = require('peer-id')
const crypto = require('libp2p-crypto')
const isIPFS = require('is-ipfs')
const { multiaddr } = require('multiaddr')
const { CID } = require('multiformats/cid')
const { create } = require('./components')

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('./types').Options} Options
 */

module.exports = {
  create,
  crypto,
  isIPFS,
  CID,
  multiaddr,
  PeerId,
  globSource,
  urlSource
}
