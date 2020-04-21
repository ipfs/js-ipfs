'use strict'

const log = require('debug')('ipfs')
const mergeOptions = require('merge-options')
const { isTest } = require('ipfs-utils/src/env')
const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')
const { Buffer } = require('buffer')
const PeerId = require('peer-id')
const crypto = require('libp2p-crypto')
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
      '/dns4/node1.preload.ipfs.io/https'
    ]
  }
})

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
  globSource,
  urlSource
}
