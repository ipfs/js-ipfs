'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const log = require('debug')('ipfs-http-client:pubsub:subscribe')
const SubscriptionTracker = require('./subscription-tracker')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure((api, options) => {
  const subsTracker = SubscriptionTracker.singleton()
  const publish = require('./publish')(options)

  return async (topic, handler, options = {}) => {
    options.signal = subsTracker.subscribe(topic, handler, options.signal)

    let res

    // In Firefox, the initial call to fetch does not resolve until some data
    // is received. If this doesn't happen within 1 second send an empty message
    // to kickstart the process.
    const ffWorkaround = setTimeout(async () => {
      log(`Publishing empty message to "${topic}" to resolve subscription request`)
      try {
        await publish(topic, new Uint8Array(0), options)
      } catch (err) {
        log('Failed to publish empty message', err)
      }
    }, 1000)

    try {
      res = await api.post('pubsub/sub', {
        timeout: options.timeout,
        signal: options.signal,
        searchParams: toUrlSearchParams({
          arg: topic,
          ...options
        }),
        headers: options.headers
      })
    } catch (err) { // Initial subscribe fail, ensure we clean up
      subsTracker.unsubscribe(topic, handler)
      throw err
    }

    clearTimeout(ffWorkaround)

    readMessages(res.ndjson(), {
      onMessage: handler,
      onEnd: () => subsTracker.unsubscribe(topic, handler),
      onError: options.onError
    })
  }
})

async function readMessages (msgStream, { onMessage, onEnd, onError }) {
  onError = onError || log

  try {
    for await (const msg of msgStream) {
      try {
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
