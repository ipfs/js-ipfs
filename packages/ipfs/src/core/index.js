'use strict'

const log = require('debug')('ipfs')
const mergeOptions = require('merge-options')
// @ts-ignore
const { isTest } = require('ipfs-utils/src/env')
// @ts-ignore
const globSource = require('ipfs-utils/src/files/glob-source')
// @ts-ignore
const urlSource = require('ipfs-utils/src/files/url-source')
const { Buffer } = require('buffer')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const crypto = require('libp2p-crypto')
// @ts-ignore
const isIPFS = require('is-ipfs')
const multiaddr = require('multiaddr')
const multihash = require('multihashes')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihashing = require('multihashing-async')
const CID = require('cids')
const { NotInitializedError } = require('./errors')
const Components = require('./components')
const ApiManager = require('./api-manager')

const getDefaultOptions = () => ({
  init: true,
  start: true,
  EXPERIMENTAL: {},
  preload: {
    enabled: !isTest, // preload by default, unless in test env
    addresses: [
      '/dns4/node0.preload.ipfs.io/https',
      '/dns4/node1.preload.ipfs.io/https',
      '/dns4/node2.preload.ipfs.io/https',
      '/dns4/node3.preload.ipfs.io/https'
    ]
  }
})

/**
 * @typedef {Object} IPFSOptions
 * @property {string|import("ipfs-repo")} [repo]
 * @property {boolean} [silent]
 * @property {boolean} [init=true]
 * @property {boolean} [start=true]
 *
 * @typedef {Object} IPFS
 */

/**
 * Creates and returns a ready to use instance of an IPFS node.
 * @param {IPFSOptions} [options]
 * @returns {Promise<IPFS>}
 */
async function create (options) {
  options = mergeOptions(getDefaultOptions(), options)

  // eslint-disable-next-line no-console
  const print = options.silent ? log : console.log

  const apiManager = new ApiManager()

  const { api } = apiManager.update({
    init: Components.init({ apiManager, print, options }),
    dns: Components.dns(),
    isOnline: Components.isOnline({})
  }, async () => { throw new NotInitializedError() }) // eslint-disable-line require-await

  if (!options.init) {
    return api
  }

  await api.init()

  if (!options.start) {
    return api
  }

  return api.start()
}

module.exports = {
  create,
  crypto,
  isIPFS,
  Buffer,
  CID,
  multiaddr,
  multibase,
  multihash,
  multihashing,
  multicodec,
  PeerId,
  PeerInfo,
  globSource,
  urlSource
}
