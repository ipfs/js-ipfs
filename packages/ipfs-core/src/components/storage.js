'use strict'

const log = require('debug')('ipfs:components:peer:storage')
const createRepo = require('../runtime/repo-nodejs')
const getDefaultConfig = require('../runtime/config-nodejs')
const { ERR_REPO_NOT_INITIALIZED } = require('ipfs-repo').errors
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const PeerId = require('peer-id')
const { mergeOptions } = require('../utils')
const configService = require('./config')
const { NotEnabledError } = require('../errors')
const createLibP2P = require('./libp2p')

class Storage {
  /**
   * @private
   * @param {PeerId} peerId
   * @param {Keychain} keychain
   * @param {Repo} repo
   * @param {Print} print
   * @param {boolean} isNew
   */
  constructor (peerId, keychain, repo, print, isNew) {
    this.print = print
    this.peerId = peerId
    this.keychain = keychain
    this.repo = repo
    this.print = print
    this.isNew = isNew
  }

  /**
   *
   * @param {Options} options
   */
  static async start (options) {
    const { repoAutoMigrate: autoMigrate, repo: inputRepo, print, silent } = options

    const repo = (typeof inputRepo === 'string' || inputRepo == null)
      ? createRepo({ path: inputRepo, autoMigrate, silent })
      : inputRepo

    const { peerId, keychain, isNew } = await loadRepo(repo, options)

    // TODO: throw error?
    // @ts-ignore On start, keychain will always be available
    return new Storage(peerId, keychain, repo, print, isNew)
  }
}
module.exports = Storage

/**
 *
 * @param {Repo} repo
 * @param {RepoOptions & InitOptions} options
 * @returns {Promise<{peerId: PeerId, keychain?: Keychain, isNew:boolean }>}
 */
const loadRepo = async (repo, options) => {
  const openError = await openRepo(repo)
  if (openError == null) {
    // If opened successfully configure repo
    return { ...await configureRepo(repo, options), isNew: false }
  } else if (openError.code === ERR_REPO_NOT_INITIALIZED) {
    if (options.allowNew === false) {
      throw new NotEnabledError('Initialization of new repos disabled by config, pass `config.init.isNew: true` to enable it')
    } else {
      // If failed to open, because repo isn't initilaized and initalizing a
      // new repo allowed, init repo:
      return { ...await initRepo(repo, options), isNew: true }
    }
  } else {
    throw openError
  }
}

/**
 * Attempts to open given repo unless it is already open and returns result
 * containing repo or an error if failed.
 *
 * @param {Repo} repo
 * @returns {Promise<(Error & { code: number }) | null>}
 */
const openRepo = async (repo) => {
  // If repo is closed attempt to open it.
  if (repo.closed) {
    try {
      await repo.open()
      return null
    } catch (error) {
      return error
    }
  } else {
    return null
  }
}

/**
 * @param {Repo} repo
 * @param {RepoOptions & InitOptions} options
 * @returns {Promise<{peerId: PeerId, keychain?: Keychain}>}
 */
const initRepo = async (repo, options) => {
  // 1. Verify that repo does not exist yet (if it does and we could not
  // open it we give up)
  const exists = await repo.exists()
  log('repo exists?', exists)

  if (exists === true) {
    throw new Error('repo already exists')
  }

  // 2. Restore `peerId` from a given `.privateKey` or init new using
  // provide options.
  const peerId = options.privateKey
    ? await decodePeerId(options.privateKey)
    : await initPeerId(options)

  const identity = peerIdToIdentity(peerId)

  log('peer identity: %s', identity.PeerID)

  // 3. Init new repo with provided `.config` and restored / initalized
  // peerd identity.
  const config = {
    ...mergeOptions(applyProfiles(getDefaultConfig(), options.profiles), options.config),
    Identity: identity
  }
  await repo.init(config)

  // 4. Open initalized repo.
  await repo.open()

  log('repo opened')

  // Create libp2p for Keychain creation
  const libp2p = createLibP2P({
    options: undefined,
    multiaddrs: undefined,
    peerId,
    repo,
    config,
    keychainConfig: {
      pass: options.pass
    }
  })

  if (libp2p.keychain && libp2p.keychain.opts) {
    await libp2p.loadKeychain()

    await repo.config.set('Keychain', {
      dek: libp2p.keychain.opts.dek
    })
  }

  return { peerId, keychain: libp2p.keychain }
}

/**
 * Takes `peerId` either represented as a string serialized string or
 * an instance and returns a `PeerId` instance.
 *
 * @param {PeerId|string} peerId
 * @returns {Promise<PeerId>|PeerId}
 */
const decodePeerId = (peerId) => {
  log('using user-supplied private-key')
  return typeof peerId === 'object'
    ? peerId
    : PeerId.createFromPrivKey(uint8ArrayFromString(peerId, 'base64pad'))
}

/**
 * Initializes new PeerId by generting an underlying keypair.
 *
 * @param {Object} options
 * @param {KeyType} [options.algorithm='RSA']
 * @param {number} [options.bits=2048]
 * @param {Print} options.print
 * @returns {Promise<PeerId>}
 */
const initPeerId = ({ print, algorithm = 'RSA', bits = 2048 }) => {
  // Generate peer identity keypair + transform to desired format + add to config.
  print('generating %s-bit (rsa only) %s keypair...', bits, algorithm)
  return PeerId.create({ keyType: algorithm, bits })
}

/**
 * @param {PeerId} peerId
 */
const peerIdToIdentity = (peerId) => ({
  PeerID: peerId.toB58String(),
  /** @type {string} */
  PrivKey: uint8ArrayToString(peerId.privKey.bytes, 'base64pad')
})

/**
 * Applies passed `profiles` and a `config`  to an open repo.
 *
 * @param {Repo} repo
 * @param {ConfigureOptions} options
 * @returns {Promise<{peerId: PeerId, keychain?: Keychain}>}
 */
const configureRepo = async (repo, { config, profiles, pass }) => {
  const original = await repo.config.getAll()
  const changed = mergeConfigs(applyProfiles(original, profiles), config)

  if (original !== changed) {
    await repo.config.replace(changed)
  }

  // @ts-ignore - Identity may not be present
  const peerId = await PeerId.createFromPrivKey(changed.Identity.PrivKey)
  const libp2p = createLibP2P({
    options: undefined,
    multiaddrs: undefined,
    peerId,
    repo,
    config: changed,
    keychainConfig: {
      pass,
      ...changed.Keychain
    }
  })

  if (libp2p.keychain) {
    await libp2p.loadKeychain()
  }

  return { peerId, keychain: libp2p.keychain }
}

/**
 * @param {IPFSConfig} config
 * @param {Partial<IPFSConfig>} [changes]
 */
const mergeConfigs = (config, changes) =>
  changes ? mergeOptions(config, changes) : config

/**
 * Apply profiles (e.g. ['server', 'lowpower']) to config
 *
 * @param {IPFSConfig} config
 * @param {string[]} [profiles]
 */
const applyProfiles = (config, profiles) => {
  return (profiles || []).reduce((config, name) => {
    const profile = configService.profiles[name]
    if (!profile) {
      throw new Error(`Could not find profile with name '${name}'`)
    }
    log('applying profile %s', name)
    return profile.transform(config)
  }, config)
}

/**
 * @typedef {StorageOptions & RepoOptions & InitOptions} Options
 *
 * @typedef {Object} StorageOptions
 * @property {Repo|string} [repo='~/.jsipfs'] - The file path at which to store the
 * IPFS node’s data. Alternatively, you can set up a customized storage system
 * by providing an Repo implementation. (In browser default is 'ipfs').
 * @property {boolean} [repoAutoMigrate=true] - js-ipfs comes bundled with a tool
 * that automatically migrates your IPFS repository when a new version is
 * available.
 * @property {boolean} [repoOwner]
 * @property {IPLDOptions} [ipld]
 *
 *
 * @typedef {Object} RepoOptions
 * @property {Print} print
 * @property {IPFSConfig} [config]
 * @property {boolean} [silent]
 *
 * @typedef {Object} ConfigureOptions
 * @property {IPFSConfig} [options.config]
 * @property {string[]} [options.profiles]
 * @property {string} [options.pass]
 *
 * @typedef {Object} InitOptions - On Frist run js-ipfs will initalize a repo
 * which can be customized through this settings.
 * @property {boolean} [emptyRepo=false] - Whether to remove built-in assets,
 * like the instructional tour and empty mutable file system, from the repo.
 * @property {KeyType} [algorithm='RSA'] - The type of key to use.
 * @property {number} [bits=2048] - Number of bits to use in the generated key
 * pair (rsa only).
 * @property {PeerId|string} [privateKey] - A pre-generated private key to use.
 * **NOTE: This overrides `bits`.**
 * @property {string} [pass] - A passphrase to encrypt keys. You should
 * generally use the top-level `pass` option instead of the `init.pass`
 * option (this one will take its value from the top-level option if not set).
 * @property {string[]} [profiles] - Apply profile settings to config.
 * @property {boolean} [allowNew=true] - Set to `false` to disallow
 * initialization if the repo does not already exist.
 *
 * @typedef {import('.').IPLDOptions} IPLDOptions
 * @typedef {import('.').Print} Print
 * @typedef {import('.').IPFSConfig} IPFSConfig
 * @typedef {import('ipfs-core-types/src/repo').Repo<IPFSConfig>} Repo
 * @typedef {import('libp2p-crypto').KeyType} KeyType
 * @typedef {import('libp2p/src/keychain')} Keychain
 */
