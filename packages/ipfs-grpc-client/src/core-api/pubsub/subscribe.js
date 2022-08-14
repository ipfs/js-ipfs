import { serverStreamToIterator } from '../../utils/server-stream-to-iterator.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { subscriptions } from './subscriptions.js'
import defer from 'p-defer'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../../types').Options} opts
 */
export function grpcPubsubSubscribe (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/pubsub').API<{}>["subscribe"]}
   */
  async function pubsubSubscribe (topic, handler, options = {}) {
    const request = {
      topic
    }

    const deferred = defer()

    Promise.resolve().then(async () => {
      try {
        for await (const result of serverStreamToIterator(grpc, service, request, {
          host: opts.url,
          debug: Boolean(process.env.DEBUG),
          metadata: options,
          agent: opts.agent
        })) {
          if (result.handler) {
            const subs = subscriptions.get(topic) || new Map()
            subs.set(result.handler, handler)
            subscriptions.set(topic, subs)

            deferred.resolve()
          } else {
            /** @type {import('@libp2p/interface-pubsub').Message} */
            let msg

            if (result.type === 'signed') {
              msg = {
                type: 'signed',
                from: peerIdFromString(result.from),
                sequenceNumber: BigInt(`0x${uint8ArrayToString(result.sequenceNumber, 'base16')}`),
                data: result.data,
                topic: result.topic,
                key: result.key,
                signature: result.signature
              }
            } else {
              msg = {
                type: 'unsigned',
                data: result.data,
                topic: result.topic
              }
            }

            if (typeof handler === 'function') {
              handler(msg)
              continue
            }

            if (handler != null && typeof handler.handleEvent === 'function') {
              handler.handleEvent(msg)
            }
          }
        }
      } catch (/** @type {any} */ err) {
        if (options && options.onError) {
          options.onError(err)
        }
      }
    })

    await deferred.promise
  }

  return withTimeoutOption(pubsubSubscribe)
}
