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
 * @typedef {import('./types').Libp2pFactoryFn} Libp2pFactoryFn
 * @typedef {import('./types').Libp2pFactoryFnArgs} Libp2pFactoryFnArgs
 * @typedef {import('./types').InitOptions} InitOptions
 * @typedef {import('./types').RelayOptions} RelayOptions
 * @typedef {import('./types').PreloadOptions} PreloadOptions
 * @typedef {import('./types').ExperimentalOptions} ExperimentalOptions
 * @typedef {import('./types').Preload} Preload
 * @typedef {import('./types').MfsPreload} MfsPreload
 * @typedef {import('./types').LoadBaseFn} LoadBaseFn
 * @typedef {import('./types').LoadCodecFn} LoadCodecFn
 * @typedef {import('./types').LoadHasherFn} LoadHasherFn
 * @typedef {import('./types').IPLDOptions} IPLDOptions
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
