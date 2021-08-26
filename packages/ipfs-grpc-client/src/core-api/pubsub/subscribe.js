'use strict'

const serverStreamToIterator = require('../../utils/server-stream-to-iterator')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const subscriptions = require('./subscriptions')
const defer = require('p-defer')

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../../types').Options} opts
 */
module.exports = function grpcPubsubSubscribe (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/pubsub').API["subscribe"]}
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
            handler({
              from: result.from,
              seqno: result.seqno,
              data: result.data,
              topicIDs: result.topicIDs
            })
          }
        }
      } catch (err) {
        if (options && options.onError) {
          options.onError(err)
        }
      }
    })

    await deferred.promise
  }

  return withTimeoutOption(pubsubSubscribe)
}
