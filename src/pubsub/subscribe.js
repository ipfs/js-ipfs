'use strict'

const ndjson = require('iterable-ndjson')
const explain = require('explain-error')
const bs58 = require('bs58')
const { Buffer } = require('buffer')
const log = require('debug')('ipfs-http-client:pubsub:subscribe')
const configure = require('../lib/configure')
const toIterable = require('../lib/stream-to-iterable')
const SubscriptionTracker = require('./subscription-tracker')

module.exports = configure((config) => {
  const ky = config.ky
  const subsTracker = SubscriptionTracker.singleton()
  const publish = require('./publish')(config)

  return async (topic, handler, options) => {
    options = options || {}
    options.signal = subsTracker.subscribe(topic, handler, options.signal)

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', topic)
    if (options.discover != null) searchParams.set('discover', options.discover)

    let res

    // In Firefox, the initial call to fetch does not resolve until some data
    // is received. If this doesn't happen within 1 second send an empty message
    // to kickstart the process.
    const ffWorkaround = setTimeout(async () => {
      log(`Publishing empty message to "${topic}" to resolve subscription request`)
      try {
        await publish(topic, Buffer.alloc(0), options)
      } catch (err) {
        log('Failed to publish empty message', err)
      }
    }, 1000)

    try {
      res = await ky.post('pubsub/sub', {
        timeout: options.timeout,
        signal: options.signal,
        headers: options.headers,
        searchParams
      })
    } catch (err) { // Initial subscribe fail, ensure we clean up
      subsTracker.unsubscribe(topic, handler)
      throw err
    }

    clearTimeout(ffWorkaround)

    readMessages(ndjson(toIterable(res.body)), {
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
          from: bs58.encode(Buffer.from(msg.from, 'base64')).toString(),
          data: Buffer.from(msg.data, 'base64'),
          seqno: Buffer.from(msg.seqno, 'base64'),
          topicIDs: msg.topicIDs
        })
      } catch (err) {
        onError(explain(err, 'Failed to parse pubsub message'), false, msg) // Not fatal
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
