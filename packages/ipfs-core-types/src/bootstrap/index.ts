import type { AbortOptions } from '../utils'
import type { Multiaddr } from 'multiaddr'

export interface API<OptionExtension = {}> {
  /**
   * Add a peer address to the bootstrap list
   *
   * @example
   * ```js
   * const validIp4 = '/ip4/104....9z'
   *
   * const res = await ipfs.bootstrap.add(validIp4)
   * console.log(res.Peers)
   * // Logs:
   * // ['/ip4/104....9z']
   * ```
   */
  add: (addr: Multiaddr, options?: AbortOptions & OptionExtension) => Promise<{ Peers: Multiaddr[] }>

  /**
   * Reset the bootstrap list to contain only the default bootstrap nodes
   *
   * @example
   * ```js
   * const res = await ipfs.bootstrap.list()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  reset: (options?: AbortOptions & OptionExtension) => Promise<{ Peers: Multiaddr[] }>

  /**
   * List all peer addresses in the bootstrap list
   *
   * @example
   * ```js
   * const res = await ipfs.bootstrap.list()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  list: (options?: AbortOptions & OptionExtension) => Promise<{ Peers: Multiaddr[] }>

  /**
   * Remove a peer address from the bootstrap list
   *
   * @example
   * ```js
   * const res = await ipfs.bootstrap.list()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  rm: (addr: Multiaddr, options?: AbortOptions & OptionExtension) => Promise<{ Peers: Multiaddr[] }>

  /**
   * Remove all peer addresses from the bootstrap list
   *
   * @example
   * ```js
   * const res = await ipfs.bootstrap.clear()
   * console.log(res.Peers)
   * // Logs:
   * // [address1, address2, ...]
   * ```
   */
  clear: (options?: AbortOptions & OptionExtension) => Promise<{ Peers: Multiaddr[] }>
}
