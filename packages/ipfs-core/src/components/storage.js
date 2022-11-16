import { logger } from '@libp2p/logger'
import { createRepo } from 'ipfs-core-config/repo'
import getDefaultConfig from 'ipfs-core-config/config'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { peerIdFromKeys } from '@libp2p/peer-id'
import { isPeerId } from '@libp2p/interface-peer-id'
import mergeOpts from 'merge-options'
import { profiles as configProfiles } from './config/profiles.js'
import { NotEnabledError, NotInitializedError } from '../errors.js'
import { createLibp2p } from './libp2p.js'
import { ERR_REPO_NOT_INITIALIZED } from 'ipfs-repo/errors'
import { createEd25519PeerId, createRSAPeerId } from '@libp2p/peer-id-factory'
import errCode from 'err-code'
import { unmarshalPrivateKey } from '@libp2p/crypto/keys'
import { Key } from 'interface-datastore/key'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })
const log = logger('ipfs:components:peer:storage')

/**
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('../types').Options} IPFSOptions
 * @typedef {import('../types').InitOptions} InitOptions
 * @typedef {import('../types').Print} Print
 * @typedef {import('ipfs-core-types/src/config').Config} IPFSConfig
 * @typedef {import('@libp2p/crypto/keys').KeyTypes} KeyType
 * @typedef {import('@libp2p/interface-keychain').KeyChain} Keychain
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 */

export class Storage {
  /**
   * @private
   * @param {PeerId} peerId
   * @param {Keychain} keychain
   * @param {IPFSRepo} repo
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
   * @param {Print} print
   * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
   * @param {IPFSOptions} options
   */
  static async start (print, codecs, options) {
    const { repoAutoMigrate, repo: inputRepo, onMigrationProgress } = options

    const repo = (typeof inputRepo === 'string' || inputRepo == null)
      ? createRepo(print, codecs, {
        path: inputRepo,
        autoMigrate: repoAutoMigrate,
        onMigrationProgress: onMigrationProgress
      })
      : inputRepo

    const { peerId, keychain, isNew } = await loadRepo(print, repo, options)

    // TODO: throw error?
    // @ts-expect-error On start, keychain will always be available
    return new Storage(peerId, keychain, repo, print, isNew)
  }
}

/**
 * @param {Print} print
 * @param {IPFSRepo} repo
 * @param {IPFSOptions} options
 */
const loadRepo = async (print, repo, options) => {
  if (!repo.closed) {
    return { ...await configureRepo(repo, options), isNew: false }
  }

  try {
    await repo.open()

    return { ...await configureRepo(repo, options), isNew: false }
  } catch (/** @type {any} */ err) {
    if (err.code !== ERR_REPO_NOT_INITIALIZED) {
      throw err
    }

    if (options.init && options.init.allowNew === false) {
      throw new NotEnabledError('Initialization of new repos disabled by config, pass `config.init.isNew: true` to enable it')
    }

    return { ...await initRepo(print, repo, options), isNew: true }
  }
}

/**
 * @param {Print} print
 * @param {IPFSRepo} repo
 * @param {IPFSOptions} options
 * @returns {Promise<{peerId: PeerId, keychain?: Keychain}>}
 */
const initRepo = async (print, repo, options) => {
  const initOptions = options.init || {}

  // 1. Verify that repo does not exist yet (if it does and we could not open it we give up)
  const exists = await repo.exists()
  log('repo exists?', exists)

  if (exists === true) {
    throw new Error('repo already exists')
  }

  // 2. Restore `peerId` from a given `.privateKey` or init new using provided options.
  const peerId = initOptions.privateKey
    ? await decodePeerId(initOptions.privateKey)
    : await initPeerId(print, initOptions)

  const identity = peerIdToIdentity(peerId)

  log('peer identity: %s', identity.PeerID)

  // 3. Init new repo with provided `.config` and restored / initialized `peerId`
  const config = {
    ...mergeOptions(applyProfiles(getDefaultConfig(), initOptions.profiles), options.config),
    Identity: identity
  }
  await repo.init(config)

  // 4. Open initialized repo.
  await repo.open()

  log('repo opened')

  /** @type {import('./libp2p').KeychainConfig} */
  const keychainConfig = {
    pass: options.pass
  }

  try {
    keychainConfig.dek = await repo.config.get('Keychain.DEK')
  } catch (/** @type {any} */ err) {
    if (err.code !== 'ERR_NOT_FOUND') {
      throw err
    }
  }

  // Create libp2p for Keychain creation
  const libp2p = await createLibp2p({
    options: undefined,
    multiaddrs: undefined,
    peerId,
    repo,
    config,
    keychainConfig
  })

  if (!(await repo.datastore.has(new Key('/info/self')))) {
    await libp2p.keychain.importPeer('self', peerId)
  }

  await repo.config.set('Keychain', {
    // @ts-expect-error private field
    DEK: libp2p.keychain.init.dek
  })

  return { peerId, keychain: libp2p.keychain }
}

/**
 * Takes `peerId` either represented as a string serialized string or
 * an instance and returns a `PeerId` instance.
 *
 * @param {PeerId|string} peerId
 * @returns {Promise<PeerId>}
 */
const decodePeerId = async (peerId) => {
  log('using user-supplied private-key')
  if (isPeerId(peerId)) {
    return peerId
  }

  const rawPrivateKey = uint8ArrayFromString(peerId, 'base64pad')
  const key = await unmarshalPrivateKey(rawPrivateKey)
  return await peerIdFromKeys(key.public.bytes, key.bytes)
}

/**
 * Initializes new PeerId by generating an underlying keypair.
 *
 * @param {Print} print
 * @param {object} options
 * @param {KeyType} [options.algorithm='Ed25519']
 * @param {number} [options.bits=2048]
 * @returns {Promise<PeerId>}
 */
const initPeerId = (print, { algorithm = 'Ed25519', bits = 2048 }) => {
  // Generate peer identity keypair + transform to desired format + add to config.
  print('generating %s keypair...', algorithm)

  if (algorithm === 'Ed25519') {
    return createEd25519PeerId()
  }

  if (algorithm === 'RSA') {
    return createRSAPeerId({ bits })
  }

  throw errCode(new Error('Unknown PeerId algorithm'), 'ERR_UNKNOWN_PEER_ID_ALGORITHM')
}

/**
 * @param {PeerId} peerId
 */
const peerIdToIdentity = (peerId) => {
  if (peerId.privateKey == null) {
    throw errCode(new Error('Private key missing'), 'ERR_MISSING_PRIVATE_KEY')
  }

  return {
    PeerID: peerId.toString(),
    /** @type {string} */
    PrivKey: uint8ArrayToString(peerId.privateKey, 'base64pad')
  }
}

/**
 * Applies passed `profiles` and a `config` to an open repo.
 *
 * @param {IPFSRepo} repo
 * @param {IPFSOptions} options
 * @returns {Promise<{peerId: PeerId, keychain?: Keychain}>}
 */
const configureRepo = async (repo, options) => {
  const config = options.config
  const profiles = (options.init && options.init.profiles) || []
  const pass = options.pass
  const original = await repo.config.getAll()
  const changed = mergeConfigs(applyProfiles(original, profiles), config)

  if (original !== changed) {
    await repo.config.replace(changed)
  }

  if (!changed.Identity || !changed.Identity.PrivKey) {
    throw new NotInitializedError('No private key was found in the config, please intialize the repo')
  }

  const buf = uint8ArrayFromString(changed.Identity.PrivKey, 'base64pad')
  const key = await unmarshalPrivateKey(buf)
  const peerId = await peerIdFromKeys(key.public.bytes, key.bytes)
  const libp2p = await createLibp2p({
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
    const profile = configProfiles[name]
    if (!profile) {
      throw new Error(`Could not find profile with name '${name}'`)
    }
    log('applying profile %s', name)
    return profile.transform(config)
  }, config)
}
