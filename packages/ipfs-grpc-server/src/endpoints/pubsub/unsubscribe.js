import { subscriptions } from './subscriptions.js'
import { callbackify } from 'util'

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {import('../../types').Options} options
 */
export function grpcPubsubUnsubscribe (ipfs, options = {}) {
  /**
   * TODO: Fill out input/output types after https://github.com/ipfs/js-ipfs/issues/3594
   *
   * @type {import('../../types').UnaryEndpoint<any, any, any>}
   */
  async function pubsubUnsubscribe (request, metadata) {
    const opts = {
      ...metadata
    }

    if (!request.handlers || !request.handlers.length) {
      await ipfs.pubsub.unsubscribe(request.topic, undefined, opts)

      return {}
    }

    for (const handlerId of request.handlers) {
      const handler = subscriptions.get(handlerId)

      if (!handler) {
        continue
      }

      await ipfs.pubsub.unsubscribe(request.topic, handler.onMessage, opts)

      handler.onUnsubscribe()
      subscriptions.delete(handlerId)
    }

    return {}
  }

  return callbackify(pubsubUnsubscribe)
}
