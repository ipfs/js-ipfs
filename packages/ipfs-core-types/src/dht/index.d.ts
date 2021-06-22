import type { AbortOptions } from '../utils'
import type { Multiaddr } from 'multiaddr'
import type CID from 'cids'

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
  findPeer: (peerId: string, options?: AbortOptions & OptionExtension) => Promise<PeerResult>

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
  findProvs: (cid: CID, options?: DHTFindProvsOptions & OptionExtension) => AsyncIterable<PeerResult>

  /**
   * Given a key, query the DHT for its best value.
   */
  get: (key: Uint8Array, options?: AbortOptions & OptionExtension) => Promise<Uint8Array>

  /**
     * Announce to the network that we are providing given values.
     */
  provide: (cid: CID | CID[], options?: DHTProvideOptions & OptionExtension) => AsyncIterable<DHTQueryMessage>

  /**
     * Write a key/value pair to the DHT.
     *
     * Given a key of the form /foo/bar and a value of any
     * form, this will write that value to the DHT with
     * that key.
     *
     */
  put: (key: Uint8Array, value: Uint8Array, options?: AbortOptions & OptionExtension) => AsyncIterable<DHTQueryMessage>

  /**
   * Find the closest peers to a given `PeerId`, by querying the DHT.
   */
  query: (peerId: string, options?: AbortOptions & OptionExtension) => AsyncIterable<PeerResult>
}

export interface PeerResult {
  id: string
  addrs: Multiaddr[]
}

export interface DHTFindProvsOptions extends AbortOptions {
  numProviders?: number
}

export interface DHTProvideOptions extends AbortOptions {
  recursive?: boolean
}

export enum QueryEventType {
  SendingQuery = 1,
  PeerResponse,
  FinalPeer,
  QueryError,
  Provider,
  Value,
  AddingPeer,
  DialingPeer
}

export interface DHTQueryMessage {
  extra: string
  id: string
  responses: PeerResult[]
  type: QueryEventType
}
