'use strict'

const debug = require('debug')
const log = debug('http-api:floodsub')
log.error = debug('http-api:floodsub:error')

exports = module.exports

exports.sub = {
  handler: (request, reply) => {
    const discover = request.query.discover
    const topic = request.params.topic

    console.log('API RESC: SUBSCRIBE')
    console.log('discover',discover)
    console.log('topic',topic)

    request.server.app.ipfs.floodsub.sub(topic, { discover }, (err, stream) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to subscribe to topic ${topic}: ${err}`,
          Code: 0
        }).code(500)
      }

      return reply(stream)
    })
  }
}

exports.pub = {
  handler: (request, reply) => {
    const buf = request.query.buf
    const topic = request.query.topic

    console.log('API RESC: PUBLISH')
    console.log('buf',buf)
    console.log('topic',topic)

    request.server.app.ipfs.floodsub.pub(topic, buf, (err) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to publish to topic ${topic}: ${err}`,
          Code: 0
        }).code(500)
      }

      return reply(true)
    })
  }
}
