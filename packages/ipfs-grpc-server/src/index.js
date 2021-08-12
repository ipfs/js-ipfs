'use strict'

const grpc = require('@grpc/grpc-js')
const first = require('it-first')
const debug = require('debug')('ipfs:grpc-server')
const webSocketServer = require('./utils/web-socket-server')
const loadServices = require('./utils/load-services')

const {
  Root,
  MFS,
  PubSub
} = loadServices()

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {import('./types').Options} options
 */
module.exports = async function createServer (ipfs, options = {}) {
  options = options || {}

  const server = new grpc.Server()
  server.addService(Root, {
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    add: require('./endpoints/add')(ipfs, options),
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    id: require('./endpoints/id')(ipfs, options)
  })
  server.addService(MFS, {
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    ls: require('./endpoints/mfs/ls')(ipfs, options),
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    write: require('./endpoints/mfs/write')(ipfs, options)
  })
  server.addService(PubSub, {
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    subscribe: require('./endpoints/pubsub/subscribe')(ipfs, options),
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    unsubscribe: require('./endpoints/pubsub/unsubscribe')(ipfs, options)
  })

  const socket = options.socket || await webSocketServer(ipfs, options)

  socket.on('error', (error) => debug(error))

  socket.on('data', async ({ path, metadata, channel }) => {
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    const handler = server.handlers.get(path)

    if (!handler) {
      channel.end(new Error(`Request path ${path} unimplemented`))
      return
    }

    channel.handler = handler

    switch (handler.type) {
      case 'bidi':
        handler.func(channel.source, channel.sink, metadata)
          // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
          .catch(err => {
            channel.end(err)
          })

        channel.sendMetadata({})

        for await (const output of channel.sink) {
          channel.sendMessage(output)
        }

        channel.end()

        break
      case 'unary':
        // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
        handler.func(await first(channel.source), metadata, (err, value, metadata, flags) => {
          if (err) {
            return channel.end(err)
          }

          channel.sendMetadata(metadata || {})

          if (value) {
            channel.sendMessage(value)
          }

          channel.end()
        })
        break
      case 'clientStream':
        // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
        handler.func(channel.source, metadata, (err, value, metadata, flags) => {
          if (err) {
            return channel.end(err)
          }

          channel.sendMetadata(metadata || {})

          if (value) {
            channel.sendMessage(value)
          }

          channel.end()
        })
        break
      case 'serverStream':
        // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
        handler.func(await first(channel.source), channel.sink, metadata)
          // @ts-ignore - TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
          .catch(err => {
            channel.end(err)
          })

        channel.sendMetadata({})

        for await (const output of channel.sink) {
          channel.sendMessage(output)
        }

        channel.end()

        break
      default:
        debug(`Invalid handler type ${handler.type}`)
    }
  })

  return socket
}
