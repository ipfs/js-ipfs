'use strict'

const log = require('debug')('ipfs')
const mergeOptions = require('merge-options')
const { isTest } = require('ipfs-utils/src/env')
const globSource = require('ipfs-utils/src/files/glob-source')
const urlSource = require('ipfs-utils/src/files/url-source')
const { Buffer } = require('buffer')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const crypto = require('libp2p-crypto')
const isIPFS = require('is-ipfs')
const multiaddr = require('multiaddr')
const multihash = require('multihashes')
const multibase = require('multibase')
const multicodec = require('multicodec')
const multihashing = require('multihashing-async')
const CID = require('cids')
const { NotInitializedError, NotEnabledError } = require('./errors')
const Components = require('./components')
const ApiManager = require('./api-manager')
const createRepo = require('./runtime/repo-nodejs')

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
  },
  repoAutoMigrate: false
})

async function create (options) {
  options = mergeOptions(getDefaultOptions(), options)

  // eslint-disable-next-line no-console
  const print = options.silent ? log : console.log
  const repo = typeof options.repo === 'string' || options.repo == null
    ? createRepo({ path: options.repo, autoMigrate: options.repoAutoMigrate })
    : options.repo

  const apiManager = new ApiManager()
  const { api } = apiManager.update({
    init: Components.init({
      apiManager,
      print,
      options,
      repo
    }),
    dns: Components.dns(),
    isOnline: Components.isOnline({})
  }, async () => { throw new NotInitializedError() }) // eslint-disable-line require-await

  if (await repo.isInitialized()) {
    // FIXME: the repo is already initialised so we are only calling init
    // here for the side effect of it updating the available api operations
    await api.init()
  } else if (options.init.allowNew === false) {
    throw new NotEnabledError('new repo initialization is not enabled')
  }

  if (options.init && !(await repo.isInitialized())) {
    await api.init()
  }

  if (options.start) {
    return api.start()
  }

  return api
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
