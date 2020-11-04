'use strict'

const grpc = require('@grpc/grpc-js')
const first = require('it-first')
const debug = require('debug')('ipfs:grpc-server')
const webSocketServer = require('./utils/web-socket-server')
const loadServices = require('./utils/load-services')

const {
  Root,
  MFS
} = loadServices()

module.exports = async function createServer (ipfs, options = {}) {
  options = options || {}

  const server = new grpc.Server()
  server.addService(Root, {
    add: require('./endpoints/add')(ipfs, options),
    // @ts-ignore
    id: require('./endpoints/id')(ipfs, options)
  })
  server.addService(MFS, {
    ls: require('./endpoints/mfs/ls')(ipfs, options),
    // @ts-ignore
    write: require('./endpoints/mfs/write')(ipfs, options)
  })

  const socket = options.socket || await webSocketServer(ipfs, options)

  socket.on('error', (error) => debug(error))

  socket.on('data', async ({ path, metadata, channel }) => {
    // @ts-ignore
    const handler = server.handlers.get(path)

    if (!handler) {
      channel.end(new Error(`Request path ${path} unimplemented`))
      return
    }

    channel.handler = handler

    switch (handler.type) {
      case 'bidi':
        handler.func(channel.source, channel.sink, metadata)
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
        handler.func(await first(channel.source), channel.sink, metadata)
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
