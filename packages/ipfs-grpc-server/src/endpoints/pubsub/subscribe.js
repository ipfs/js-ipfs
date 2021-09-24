import { subscriptions } from './subscriptions.js'
import { nanoid } from 'nanoid'

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {import('../../types').Options} options
 */
export function grpcPubsubSubscribe (ipfs, options = {}) {
  /**
   * TODO: Fill out input/output types after https://github.com/ipfs/js-ipfs/issues/3594
   *
   * @type {import('../../types').ServerStreamingEndpoint<any, any, any>}
   */
  async function pubsubSubscribe (request, sink, metadata) {
    const opts = {
      ...metadata
    }

    const handlerId = nanoid()
    const handler = {
      /** @type {import('ipfs-core-types/src/pubsub').MessageHandlerFn} */
      onMessage: (message) => {
        sink.push(message)
      },
      onUnsubscribe: () => {
        sink.end()
      }
    }

    subscriptions.set(handlerId, handler)

    sink.push({
      handler: handlerId
    })

    await ipfs.pubsub.subscribe(request.topic, handler.onMessage, opts)
  }

  return pubsubSubscribe
}
