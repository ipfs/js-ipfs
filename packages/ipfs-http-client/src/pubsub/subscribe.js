import { logger } from '@libp2p/logger'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { textToUrlSafeRpc, rpcToText, rpcToBytes, rpcToBigInt } from '../lib/http-rpc-wire-format.js'
import { peerIdFromString } from '@libp2p/peer-id'
const log = logger('ipfs-http-client:pubsub:subscribe')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('@libp2p/interfaces/pubsub').Message} Message
 * @typedef {(err: Error, fatal: boolean, msg?: Message) => void} ErrorHandlerFn
 * @typedef {import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions & { onError?: ErrorHandlerFn }>} PubsubAPI
 * @typedef {import('../types').Options} Options
 */

/**
 * @param {Options} options
 * @param {import('./subscription-tracker').SubscriptionTracker} subsTracker
 */
export const createSubscribe = (options, subsTracker) => {
  return configure((api) => {
    /**
     * @type {PubsubAPI["subscribe"]}
     */
    async function subscribe (topic, handler, options = {}) { // eslint-disable-line require-await
      options.signal = subsTracker.subscribe(topic, handler, options.signal)

      /** @type {(value?: any) => void} */
      let done
      /** @type {(error: Error) => void} */
      let fail

      const result = new Promise((resolve, reject) => {
        done = resolve
        fail = reject
      })

      // In Firefox, the initial call to fetch does not resolve until some data
      // is received. If this doesn't happen within 1 second assume success
      const ffWorkaround = setTimeout(() => done(), 1000)

      // Do this async to not block Firefox
      api.post('pubsub/sub', {
        signal: options.signal,
        searchParams: toUrlSearchParams({
          arg: textToUrlSafeRpc(topic),
          ...options
        }),
        headers: options.headers
      })
        .catch((err) => {
          // Initial subscribe fail, ensure we clean up
          subsTracker.unsubscribe(topic, handler)

          fail(err)
        })
        .then((response) => {
          clearTimeout(ffWorkaround)

          if (!response) {
            // if there was no response, the subscribe failed
            return
          }

          readMessages(response, {
            onMessage: (message) => {
              if (!handler) {
                return
              }

              if (typeof handler === 'function') {
                handler(message)
                return
              }

              if (typeof handler.handleEvent === 'function') {
                handler.handleEvent(message)
              }
            },
            onEnd: () => subsTracker.unsubscribe(topic, handler),
            onError: options.onError
          })

          done()
        })

      return result
    }
    return subscribe
  })(options)
}

/**
 * @param {import('ipfs-utils/src/types').ExtendedResponse} response
 * @param {object} options
 * @param {(message: Message) => void} options.onMessage
 * @param {() => void} options.onEnd
 * @param {ErrorHandlerFn} [options.onError]
 */
async function readMessages (response, { onMessage, onEnd, onError }) {
  onError = onError || log

  try {
    for await (const msg of response.ndjson()) {
      try {
        if (!msg.from) {
          continue
        }

        onMessage({
          from: peerIdFromString(msg.from),
          data: rpcToBytes(msg.data),
          sequenceNumber: rpcToBigInt(msg.seqno),
          topic: rpcToText(msg.topicIDs[0])
        })
      } catch (/** @type {any} */ err) {
        err.message = `Failed to parse pubsub message: ${err.message}`
        onError(err, false, msg) // Not fatal
      }
    }
  } catch (/** @type {any} */ err) {
    if (!isAbortError(err)) {
      onError(err, true) // Fatal
    }
  } finally {
    onEnd()
  }
}

/**
 * @param {Error & {type?:string}} error
 * @returns {boolean}
 */
const isAbortError = error => {
  switch (error.type) {
    case 'aborted':
      return true
    // It is `abort` in Electron instead of `aborted`
    case 'abort':
      return true
    default:
      // FIXME: In testing with Chrome, err.type is undefined (should not be!)
      // Temporarily use the name property instead.
      return error.name === 'AbortError'
  }
}
