'use strict'

const PassThrough = require('stream').PassThrough
const bs58 = require('bs58')
const binaryQueryString = require('binary-querystring')
const Boom = require('@hapi/boom')

exports.subscribe = {
  async handler (request, h) {
    const query = request.query
    const discover = query.discover === 'true'
    const topic = query.arg

    if (!topic) {
      throw Boom.badRequest('Missing topic')
    }

    const { ipfs } = request.server.app

    const res = new PassThrough({ highWaterMark: 1 })

    const handler = (msg) => {
      res.write(JSON.stringify({
        from: bs58.decode(msg.from).toString('base64'),
        data: msg.data.toString('base64'),
        seqno: msg.seqno.toString('base64'),
        topicIDs: msg.topicIDs
      }) + '\n', 'utf8')
    }

    // js-ipfs-http-client needs a reply, and go-ipfs does the same thing
    res.write('{}\n')

    const unsubscribe = () => {
      ipfs.pubsub.unsubscribe(topic, handler, () => res.end())
    }

    request.events.once('disconnect', unsubscribe)
    request.events.once('finish', unsubscribe)

    await ipfs.pubsub.subscribe(topic, handler, { discover: discover })

    return h.response(res)
      .header('X-Chunked-Output', '1')
      .header('content-encoding', 'identity') // stop gzip from buffering, see https://github.com/hapijs/hapi/issues/2975
      .header('content-type', 'application/json')
  }
}

exports.publish = {
  async handler (request, h) {
    const { arg } = request.query
    const topic = arg[0]

    const rawArgs = binaryQueryString(request.url.search)
    const buf = rawArgs.arg && rawArgs.arg[1]

    const { ipfs } = request.server.app

    if (!topic) {
      throw Boom.badRequest('Missing topic')
    }

    if (!buf || buf.length === 0) {
      throw Boom.badRequest('Missing buf')
    }

    try {
      await ipfs.pubsub.publish(topic, buf)
    } catch (err) {
      throw Boom.boomify(err, { message: `Failed to publish to topic ${topic}` })
    }

    return h.response()
  }
}

exports.ls = {
  async handler (request, h) {
    const { ipfs } = request.server.app

    let subscriptions
    try {
      subscriptions = await ipfs.pubsub.ls()
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to list subscriptions' })
    }

    return h.response({ Strings: subscriptions })
  }
}

exports.peers = {
  async handler (request, h) {
    const topic = request.query.arg
    const { ipfs } = request.server.app

    let peers
    try {
      peers = await ipfs.pubsub.peers(topic)
    } catch (err) {
      const message = topic
        ? `Failed to find peers subscribed to ${topic}: ${err}`
        : `Failed to find peers: ${err}`

      throw Boom.boomify(err, { message })
    }

    return h.response({ Strings: peers })
  }
}
