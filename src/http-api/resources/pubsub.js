'use strict'

const debug = require('debug')
const pull = require('pull-stream')
const toStream = require('pull-stream-to-stream')
const toPull = require('stream-to-pull-stream')
const log = debug('http-api:pubsub')
log.error = debug('http-api:pubsub:error')

exports = module.exports

function handleError (reply, msg) {
  reply({
    Message: msg,
    Code: 0
  }).code(500)
}

exports.subscribe = {
  handler: (request, reply) => {
    const query = request.query
    const discover = query.discover === 'true'
    const topic = query.arg

    if (!topic) {
      return handleError(reply, 'Missing topic')
    }

    const ipfs = request.server.app.ipfs

    ipfs.pubsub.subscribe(topic, {
      discover: discover
    }, (err, stream) => {
      if (err) {
        return handleError(reply, `Failed to subscribe to topic ${topic}: ${err}`)
      }

      // TODO: expose pull-streams on floodsub and use them here
      const res = toStream.source(pull(
        toPull(stream),
        pull.map((obj) => JSON.stringify({
          from: obj.from,
          data: obj.data.toString('base64'),
          seqno: obj.seqno.toString('base64'),
          topicCIDs: obj.topicCIDs
        }) + '\n')
      ))

      // hapi is not very clever and throws if no:
      // - _read method
      // - _readableState object
      // are there :(
      if (!res._read) {
        res._read = () => {}
        res._readableState = {}
      }

      res.destroy = () => stream.cancel()

      reply(res)
        .header('X-Chunked-Output', '1')
        .header('content-type', 'application/json')
    })
  }
}

exports.publish = {
  handler: (request, reply) => {
    const arg = request.query.arg
    const topic = arg[0]
    const buf = arg[1]

    const ipfs = request.server.app.ipfs

    if (!topic) {
      return handleError(reply, 'Missing topic')
    }

    if (!buf) {
      return handleError(reply, 'Missing buf')
    }

    ipfs.pubsub.publish(topic, buf, (err) => {
      if (err) {
        return handleError(reply, `Failed to publish to topic ${topic}: ${err}`)
      }

      reply()
    })
  }
}

exports.ls = {
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs

    ipfs.pubsub.ls((err, subscriptions) => {
      if (err) {
        return handleError(reply, `Failed to list subscriptions: ${err}`)
      }

      reply({Strings: subscriptions})
    })
  }
}

exports.peers = {
  handler: (request, reply) => {
    const topic = request.query.arg
    const ipfs = request.server.app.ipfs

    if (!topic) {
      return handleError(reply, 'Missing topic')
    }

    ipfs.pubsub.peers(topic, (err, peers) => {
      if (err) {
        return handleError(reply, `Failed to find peers subscribed to ${topic}: ${err}`)
      }

      reply({Strings: peers})
    })
  }
}
