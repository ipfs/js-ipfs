'use strict'

const peerId = require('peer-id')
const mergeOptions = require('merge-options')
const callbackify = require('callbackify')
const defaultConfig = require('../runtime/config-nodejs.js')
const Keychain = require('libp2p-keychain')
const {
  DAGNode
} = require('ipld-dag-pb')
const UnixFs = require('ipfs-unixfs')
const multicodec = require('multicodec')

const IPNS = require('../ipns')
const OfflineDatastore = require('../ipns/routing/offline-datastore')

const addDefaultAssets = require('./init-assets')

async function createPeerId (self, opts) {
  if (opts.privateKey) {
    self.log('using user-supplied private-key')
    if (typeof opts.privateKey === 'object') {
      return opts.privateKey
    } else {
      return peerId.createFromPrivKey(Buffer.from(opts.privateKey, 'base64'))
    }
  } else {
    // Generate peer identity keypair + transform to desired format + add to config.
    opts.log(`generating ${opts.bits}-bit RSA keypair...`, false)
    self.log('generating peer id: %s bits', opts.bits)

    return await peerId.create({ bits: opts.bits })
  }
}

async function createRepo (self, opts) {
  if (self.state.state() !== 'uninitialized') {
    throw new Error('Not able to init from state: ' + self.state.state())
  }

  self.state.init()
  self.log('init')

  // An initialized, open repo was passed, use this one!
  if (opts.repo) {
    self._repo = opts.repo

    return
  }

  opts.emptyRepo = opts.emptyRepo || false
  opts.bits = Number(opts.bits) || 2048
  opts.log = opts.log || function () {}

  const config = mergeOptions(defaultConfig(), self._options.config)
  let privateKey

  // Verify repo does not exist yet
  const exists = await self._repo.exists()
  self.log('repo exists?', exists)
  if (exists === true) {
    throw Error('repo already exists')
  }

  let peerId = await createPeerId(self, opts)

  self.log('identity generated')

  config.Identity = {
    PeerID: peerId.toB58String(),
    PrivKey: peerId.privKey.bytes.toString('base64')
  }
  privateKey = peerId.privKey

  if (opts.pass) {
    config.Keychain = Keychain.generateOptions()
  }

  opts.log('done')
  opts.log('peer identity: ' + config.Identity.PeerID)

  await self._repo.init(config)
  await self._repo.open()

  self.log('repo opened')

  if (opts.pass) {
    self.log('creating keychain')
    const keychainOptions = Object.assign({ passPhrase: opts.pass }, config.Keychain)
    self._keychain = new Keychain(self._repo.keys, keychainOptions)

    await self._keychain.importPeer('self', { privKey: privateKey })
  }

  // Setup the offline routing for IPNS.
  // This is primarily used for offline ipns modifications, such as the initializeKeyspace feature.
  const offlineDatastore = new OfflineDatastore(self._repo)

  self._ipns = new IPNS(offlineDatastore, self._repo.datastore, self._peerInfo, self._keychain, self._options)

  // add empty unixfs dir object (go-ipfs assumes this exists)
  return addRepoAssets(self, privateKey, opts)

}

async function addRepoAssets (self, privateKey, opts) {
  if (opts.emptyRepo) {
    return
  }

  self.log('adding assets')

  const node = new DAGNode(new UnixFs('directory').marshal())
  const cid = await self.dag.put(node, {
    version: 0,
    format: multicodec.DAG_PB,
    hashAlg: multicodec.SHA2_256
  })

  await self._ipns.initializeKeyspace(privateKey, cid.toBaseEncodedString())

  self.log('Initialised keyspace')

  if (typeof addDefaultAssets === 'function') {
    self.log('Adding default assets')

    // addDefaultAssets is undefined on browsers.
    // See package.json browser config
    return addDefaultAssets(self, opts.log)
  }
}

module.exports = function init (self) {
  return callbackify(async (opts) => {
    opts = opts || {}

    try {
      await createRepo(self, opts)
      self.log('Created repo')
      await self.preStart()

      self.log('Done pre-start')

      self.state.initialized()
      self.emit('init')
    } catch(err) {
      self.emit('error', err)

      throw err
    }
  })
}
