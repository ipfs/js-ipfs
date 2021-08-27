'use strict'

const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')
const log = require('debug')('ipfs-http-client:pubsub:subscribe')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pubsub').Message} Message
 * @typedef {(err: Error, fatal: boolean, msg?: Message) => void} ErrorHandlerFn
 * @typedef {import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions & { onError?: ErrorHandlerFn }>} PubsubAPI
 * @typedef {import('../types').Options} Options
 */

/**
 * @param {Options} options
 * @param {import('./subscription-tracker')} subsTracker
 */
module.exports = (options, subsTracker) => {
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
          arg: topic,
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
            onMessage: handler,
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
          from: uint8ArrayToString(uint8ArrayFromString(msg.from, 'base64pad'), 'base58btc'),
          data: uint8ArrayFromString(msg.data, 'base64pad'),
          seqno: uint8ArrayFromString(msg.seqno, 'base64pad'),
          topicIDs: msg.topicIDs
        })
      } catch (err) {
        err.message = `Failed to parse pubsub message: ${err.message}`
        onError(err, false, msg) // Not fatal
      }
    }
  } catch (err) {
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
