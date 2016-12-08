'use strict'

const debug = require('debug')
const ndjson = require('ndjson')
const log = debug('http-api:pubsub')
log.error = debug('http-api:pubsub:error')

exports = module.exports

exports.subscribe = {
  handler: (request, reply) => {
    const discover = request.query.discover || null
    const topic = request.params.topic

    request.server.app.ipfs.pubsub.subscribe(topic, { discover }, (err, stream) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to subscribe to topic ${topic}: ${err}`,
          Code: 0
        }).code(500)
      }

      // hapi is not very clever and throws if no:
      // - _read method
      // - _readableState object
      // are there :(
      if (!stream._read) {
        stream._read = () => {}
        stream._readableState = {}
      }

      // ndjson.serialize
      return reply(stream)
    })
  }
}

exports.publish = {
  handler: (request, reply) => {
    const buf = request.query.buf
    const topic = request.query.topic

    request.server.app.ipfs.pubsub.publish(topic, buf, (err) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to publish to topic ${topic}: ${err}`,
          Code: 0
        }).code(500)
      }

      return reply()
    })
  }
}

exports.ls = {
  handler: (request, reply) => {
    request.server.app.ipfs.pubsub.ls((err, subscriptions) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to list subscriptions: ${err}`,
          Code: 0
        }).code(500)
      }

      return reply(subscriptions)
    })
  }
}

exports.peers = {
  handler: (request, reply) => {
    const topic = request.params.topic

    request.server.app.ipfs.pubsub.peers(topic, (err, peers) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to find peers subscribed to ${topic}: ${err}`,
          Code: 0
        }).code(500)
      }

      return reply(peers)
    })
  }
}
