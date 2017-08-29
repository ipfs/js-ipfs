'use strict'

const PassThrough = require('stream').PassThrough

exports = module.exports

exports.subscribe = {
  handler: (request, reply) => {
    const query = request.query
    const discover = query.discover === 'true'
    const topic = query.arg

    if (!topic) {
      return reply(new Error('Missing topic'))
    }

    const ipfs = request.server.app.ipfs

    const res = new PassThrough({highWaterMark: 1})

    const handler = (msg) => {
      res.write(JSON.stringify({
        from: msg.from,
        data: msg.data.toString('base64'),
        seqno: msg.seqno.toString('base64'),
        topicCIDs: msg.topicCIDs
      }) + '\n', 'utf8')
    }

    // js-ipfs-api needs a reply, and go-ipfs does the same thing
    res.write('{}\n')

    const unsubscribe = () => {
      ipfs.pubsub.unsubscribe(topic, handler)
      res.end()
    }

    request.once('disconnect', unsubscribe)
    request.once('finish', unsubscribe)

    ipfs.pubsub.subscribe(topic, {
      discover: discover
    }, handler, (err) => {
      if (err) {
        return reply(err)
      }

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
      return reply(new Error('Missing topic'))
    }

    if (!buf) {
      return reply(new Error('Missing buf'))
    }

    ipfs.pubsub.publish(topic, new Buffer(String(buf)), (err) => {
      if (err) {
        return reply(new Error(`Failed to publish to topic ${topic}: ${err}`))
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
        return reply(new Error(`Failed to list subscriptions: ${err}`))
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
      return reply(new Error('Missing topic'))
    }

    ipfs.pubsub.peers(topic, (err, peers) => {
      if (err) {
        return reply(new Error(`Failed to find peers subscribed to ${topic}: ${err}`))
      }

      reply({Strings: peers})
    })
  }
}
