import CID from 'cids';
import type { AbortOptions } from '../../utils'

export interface API<OptionExtension = {}> {
  /**
   * Cancel a name subscription.
   *
   * @example
   * ```js
   * const name = 'QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm'
   * const result = await ipfs.name.pubsub.cancel(name)
   * console.log(result.canceled)
   * // Logs: true
   * ```
   */
  cancel: (name: string, options?: AbortOptions & OptionExtension) => Promise<PubsubCancelResult>

  /**
   * Query the state of IPNS pubsub.
   *
   * @returns {Promise<{ enabled: boolean }>}
   * ```js
   * const result = await ipfs.name.pubsub.state()
   * console.log(result.enabled)
   * // Logs: true
   * ```
   */
  state: (options?: AbortOptions & OptionExtension) => Promise<PubsubStateResult>

  /**
   * Show current name subscriptions.
   *
   * @example
   * ```js
   * const result = await ipfs.name.pubsub.subs()
   * console.log(result)
   * // Logs: ['/ipns/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm']
   * ```
   */
  subs: (options?: AbortOptions & OptionExtension) => Promise<string[]>
}

export interface PubsubCancelResult {
  canceled: boolean
}

export interface PubsubStateResult {
  enabled: boolean
}
