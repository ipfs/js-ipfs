import grpc from '@grpc/grpc-js'
import first from 'it-first'
import debug from 'debug'
import { webSocketServer } from './utils/web-socket-server.js'
import { loadServices } from './utils/load-services.js'
import { grpcAdd } from './endpoints/add.js'
import { grpcId } from './endpoints/id.js'
import { grpcMfsLs } from './endpoints/mfs/ls.js'
import { grpcMfsWrite } from './endpoints/mfs/write.js'
import { grpcPubsubSubscribe } from './endpoints/pubsub/subscribe.js'
import { grpcPubsubUnsubscribe } from './endpoints/pubsub/unsubscribe.js'

const log = debug('ipfs:grpc-server')

const {
  Root,
  MFS,
  PubSub
} = loadServices()

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {import('./types').Options} options
 */
export async function createServer (ipfs, options = {}) {
  options = options || {}

  const server = new grpc.Server()
  server.addService(Root, {
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    add: grpcAdd(ipfs, options),
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    id: grpcId(ipfs, options)
  })
  server.addService(MFS, {
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    ls: grpcMfsLs(ipfs, options),
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    write: grpcMfsWrite(ipfs, options)
  })
  server.addService(PubSub, {
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    subscribe: grpcPubsubSubscribe(ipfs, options),
    // @ts-ignore - types differ because we only invoke via websockets - https://github.com/ipfs/js-ipfs/issues/3594
    unsubscribe: grpcPubsubUnsubscribe(ipfs, options)
  })

  const socket = options.socket || await webSocketServer(ipfs, options)

  socket.on('error', (error) => log(error))

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
        log(`Invalid handler type ${handler.type}`)
    }
  })

  return socket
}
