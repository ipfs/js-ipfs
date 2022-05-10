import type { AbortOptions } from '../utils'
import type { CID } from 'multiformats/cid'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { PeerInfo } from '@libp2p/interfaces/peer-info'

export interface API<OptionExtension = {}> {
  /**
   * Query the DHT for all multiaddresses associated with a `PeerId`.
   *
   * @example
   * ```js
   * const info = await ipfs.dht.findPeer('QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt')
   *
   * console.log(info.id)
   * // QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt
   *
   * info.addrs.forEach(addr => console.log(addr.toString()))
   * // '/ip4/147.75.94.115/udp/4001/quic'
   * // '/ip6/2604:1380:3000:1f00::1/udp/4001/quic'
   * // '/dnsaddr/bootstrap.libp2p.io'
   * // '/ip6/2604:1380:3000:1f00::1/tcp/4001'
   * // '/ip4/147.75.94.115/tcp/4001'
   * ```
   */
  findPeer: (peerId: PeerId, options?: AbortOptions & OptionExtension) => AsyncIterable<QueryEvent>

  /**
   * Find peers in the DHT that can provide a specific value, given a CID.
   *
   * @example
   * ```js
   * const providers = ipfs.dht.findProvs('QmdPAhQRxrDKqkGPvQzBvjYe3kU8kiEEAd2J6ETEamKAD9')
   * for await (const provider of providers) {
   *   console.log(provider.id.toString())
   * }
   * ```
   */
  findProvs: (cid: CID, options?: AbortOptions & OptionExtension) => AsyncIterable<QueryEvent>

  /**
   * Given a key, query the DHT for its best value.
   */
  get: (key: string | Uint8Array, options?: AbortOptions & OptionExtension) => AsyncIterable<QueryEvent>

  /**
   * Announce to the network that we are providing given values.
   */
  provide: (cid: CID, options?: DHTProvideOptions & OptionExtension) => AsyncIterable<QueryEvent>

  /**
   * Write a key/value pair to the DHT.
   *
   * Given a key of the form /foo/bar and a value of any
   * form, this will write that value to the DHT with
   * that key.
   */
  put: (key: string | Uint8Array, value: Uint8Array, options?: AbortOptions & OptionExtension) => AsyncIterable<QueryEvent>

  /**
   * Find the closest peers to a given `PeerId` or `CID`, by querying the DHT.
   */
  query: (peerId: PeerId | CID, options?: AbortOptions & OptionExtension) => AsyncIterable<QueryEvent>
}

export interface DHTProvideOptions extends AbortOptions {
  recursive?: boolean
}

export enum EventTypes {
  SENDING_QUERY = 0,
  PEER_RESPONSE,
  FINAL_PEER,
  QUERY_ERROR,
  PROVIDER,
  VALUE,
  ADDING_PEER,
  DIALING_PEER
}

/**
 * The types of messages set/received during DHT queries
 */
export enum MessageType {
  PUT_VALUE = 0,
  GET_VALUE,
  ADD_PROVIDER,
  GET_PROVIDERS,
  FIND_NODE,
  PING
}

export type MessageName = keyof typeof MessageType

export interface DHTRecord {
  key: Uint8Array
  value: Uint8Array
  timeReceived?: Date
}

export interface SendingQueryEvent {
  type: EventTypes.SENDING_QUERY
  name: 'SENDING_QUERY'
}

export interface PeerResponseEvent {
  from: PeerId
  type: EventTypes.PEER_RESPONSE
  name: 'PEER_RESPONSE'
  messageType: MessageType
  messageName: MessageName
  providers: PeerInfo[]
  closer: PeerInfo[]
  record?: DHTRecord
}

export interface FinalPeerEvent {
  peer: PeerInfo
  type: EventTypes.FINAL_PEER
  name: 'FINAL_PEER'
}

export interface QueryErrorEvent {
  type: EventTypes.QUERY_ERROR
  name: 'QUERY_ERROR'
  error: Error
}

export interface ProviderEvent {
  type: EventTypes.PROVIDER
  name: 'PROVIDER'
  providers: PeerInfo[]
}

export interface ValueEvent {
  type: EventTypes.VALUE
  name: 'VALUE'
  value: Uint8Array
}

export interface AddingPeerEvent {
  type: EventTypes.ADDING_PEER
  name: 'ADDING_PEER'
  peer: PeerId
}

export interface DialingPeerEvent {
  peer: PeerId
  type: EventTypes.DIALING_PEER
  name: 'DIALING_PEER'
}

export type QueryEvent = SendingQueryEvent | PeerResponseEvent | FinalPeerEvent | QueryErrorEvent | ProviderEvent | ValueEvent | AddingPeerEvent | DialingPeerEvent
