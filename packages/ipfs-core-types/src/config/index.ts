import type { AbortOptions } from '../utils'
import type { API as ProfilesAPI } from './profiles'

export interface API<OptionExtension = {}> {
  /**
   * Returns a value from the currently being used config. If the daemon
   * is off, it returns the value from the stored config.
   */
  get: (key: string, options?: AbortOptions & OptionExtension) => Promise<string | object>

  /**
   * Returns the full config been used. If the daemon is off, it returns the
   * stored config
   */
  getAll: (options?: AbortOptions & OptionExtension) => Promise<Config>

  /**
   * Adds or replaces a config value. Note that restarting the node will be
   * necessary for any change to take effect.
   */
  set: (key: string, value: any, options?: AbortOptions & OptionExtension) => Promise<void>

  /**
   * Replaces the full config. Note that restarting the node will be
   * necessary for any change to take effect.
   */
  replace: (config: Config, options?: AbortOptions & OptionExtension) => Promise<void>

  profiles: ProfilesAPI
}

export interface Config {
  Addresses?: AddressConfig
  API?: APIConfig
  Profiles?: string
  Bootstrap?: string[]
  Discovery?: DiscoveryConfig
  Datastore?: DatastoreConfig
  Identity?: IdentityConfig
  Keychain?: KeychainConfig
  Pubsub?: PubsubConfig
  Swarm?: SwarmConfig
  Routing?: RoutingConfig
}

/**
 * Contains information about various listener addresses to be used by this node
 */
export interface AddressConfig {
  API?: string
  RPC?: string
  Delegates?: string[]
  Gateway?: string
  Swarm?: string[]
  Announce?: string[]
  NoAnnounce?: string[]
}

export interface APIConfig {
  HTTPHeaders?: Record<string, string[]>
}

export interface DiscoveryConfig {
  MDNS?: MDNSDiscovery
  webRTCStar?: WebRTCStarDiscovery
}

export interface MDNSDiscovery {
  Enabled?: boolean
  Interval?: number
}

export interface WebRTCStarDiscovery {
  Enabled?: boolean
}

export interface DatastoreConfig {
  Spec?: DatastoreSpec
}

export interface DatastoreType {
  type: string
  path: string
  sync?: boolean
  shardFunc?: string
  compression?: string
}

export interface DatastoreMountPoint {
  mountpoint: string
  type: string
  prefix: string
  child: DatastoreType
}

export interface DatastoreSpec {
  type?: string
  mounts?: DatastoreMountPoint[]
}

export interface IdentityConfig {
  /**
   * The unique PKI identity label for this configs peer. Set on init and never
   * read, its merely here for convenience. IPFS will always generate the peerID
   * from its keypair at runtime.
   */
  PeerID: string

  /**
   * The base64 encoded protobuf describing (and containing) the nodes private key.
   */
  PrivKey: string
}

export interface KeychainConfig {
  DEK?: DEK
}

export interface DEK {
  keyLength?: number
  iterationCount?: number
  salt?: string
  hash?: string
}

export interface PubsubConfig {
  PubSubRouter?: 'gossipsub' | 'floodsub'
  Enabled?: boolean
}

export interface SwarmConfig {
  ConnMgr?: ConnMgrConfig
  DisableNatPortMap?: boolean
}

export interface ConnMgrConfig {
  LowWater?: number
  HighWater?: number
}

export interface RoutingConfig {
  Type?: string
}
