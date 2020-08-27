'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const log = require('debug')('ipfs-http-client:pubsub:subscribe')
const SubscriptionTracker = require('./subscription-tracker')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure((api, options) => {
  const subsTracker = SubscriptionTracker.singleton()

  return async (topic, handler, options = {}) => { // eslint-disable-line require-await
    options.signal = subsTracker.subscribe(topic, handler, options.signal)

    let done
    let fail

    const result = new Promise((resolve, reject) => {
      done = resolve
      fail = reject
    })

    // In Firefox, the initial call to fetch does not resolve until some data
    // is received. If this doesn't happen within 1 second assume success
    const ffWorkaround = setTimeout(() => done(), 1000)

    // Do this async to not block Firefox
    setTimeout(() => {
      api.post('pubsub/sub', {
        timeout: options.timeout,
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

          readMessages(response.ndjson(), {
            onMessage: handler,
            onEnd: () => subsTracker.unsubscribe(topic, handler),
            onError: options.onError
          })

          done()
        })
    }, 0)

    return result
  }
})

async function readMessages (msgStream, { onMessage, onEnd, onError }) {
  onError = onError || log

  try {
    for await (const msg of msgStream) {
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
    // FIXME: In testing with Chrome, err.type is undefined (should not be!)
    // Temporarily use the name property instead.
    if (err.type !== 'aborted' && err.name !== 'AbortError') {
      onError(err, true) // Fatal
    }
  } finally {
    onEnd()
  }
}
