'use strict'

const debug = require('debug')
const log = debug('http-api:floodsub')
log.error = debug('http-api:floodsub:error')

exports = module.exports

exports.start = {
  handler: (request, reply) => {
    request.server.app.ipfs.floodsub.start((err, floodsub) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to start: ${err}`,
          Code: 0
        }).code(500)
      }

      return reply(floodsub)
    })
  }
}

exports.subscribe = {
  handler: (request, reply) => {
    const discover = request.query.discover || null
    const topic = request.params.topic

    request.server.app.ipfs.floodsub.subscribe(topic, { discover }, (err, stream) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to subscribe to topic ${topic}: ${err}`,
          Code: 0
        }).code(500)
      }

      // hapi is not very clever and throws if no
      // - _read method
      // - _readableState object
      // are there :(
      if (!stream._read) {
        stream._read = () => {}
        stream._readableState = {}
      }
      return reply(stream)
    })
  }
}

exports.publish = {
  handler: (request, reply) => {
    const buf = request.query.buf
    const topic = request.query.topic

    request.server.app.ipfs.floodsub.publish(topic, buf, (err) => {
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

exports.unsubscribe = {
  handler: (request, reply) => {
    const topic = request.params.topic

    request.server.app.ipfs.floodsub.unsubscribe(topic, (err) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to unsubscribe from topic ${topic}: ${err}`,
          Code: 0
        }).code(500)
      }

      return reply()
    })
  }
}
