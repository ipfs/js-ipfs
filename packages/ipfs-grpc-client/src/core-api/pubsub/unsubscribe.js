import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { toHeaders } from '../../utils/to-headers.js'
import { unaryToPromise } from '../../utils/unary-to-promise.js'
import { subscriptions } from './subscriptions.js'

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../../types').Options} opts
 */
export function grpcPubsubUnsubscribe (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/pubsub').API<{}>["unsubscribe"]}
   */
  async function pubsubUnsubscribe (topic, handler, options = {}) {
    const handlers = []
    const subs = subscriptions.get(topic)

    if (!subs) {
      return
    }

    if (handler) {
      for (const [key, value] of subs.entries()) {
        if (value === handler) {
          handlers.push(key)
        }
      }
    } else {

    }

    const request = {
      topic,
      handlers
    }

    await unaryToPromise(grpc, service, request, {
      host: opts.url,
      metadata: toHeaders(options),
      agent: opts.agent
    })

    for (const handlerId of handlers) {
      subs.delete(handlerId)
    }

    if (!subs.size) {
      subscriptions.delete(topic)
    }
  }

  return withTimeoutOption(pubsubUnsubscribe)
}
