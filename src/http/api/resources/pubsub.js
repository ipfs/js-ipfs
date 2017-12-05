'use strict'

const PassThrough = require('stream').PassThrough
const bs58 = require('bs58')
const binaryQueryString = require('binary-querystring')

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
        from: bs58.decode(msg.from).toString('base64'),
        data: msg.data.toString('base64'),
        seqno: msg.seqno.toString('base64'),
        topicIDs: msg.topicIDs
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
        .header('content-encoding', 'identity') // stop gzip from buffering, see https://github.com/hapijs/hapi/issues/2975
        .header('content-type', 'application/json')
    })
  }
}

exports.publish = {
  handler: (request, reply) => {
    const arg = request.query.arg
    const topic = arg[0]

    const rawArgs = binaryQueryString(request.url.search)
    const buf = rawArgs.arg && rawArgs.arg[1]

    const ipfs = request.server.app.ipfs

    if (!topic) {
      return reply(new Error('Missing topic'))
    }

    if (!buf || buf.length === 0) {
      return reply(new Error('Missing buf'))
    }

    ipfs.pubsub.publish(topic, buf, (err) => {
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

    ipfs.pubsub.peers(topic, (err, peers) => {
      if (err) {
        const message = topic
          ? `Failed to find peers subscribed to ${topic}: ${err}`
          : `Failed to find peers: ${err}`

        return reply(new Error(message))
      }

      reply({Strings: peers})
    })
  }
}
