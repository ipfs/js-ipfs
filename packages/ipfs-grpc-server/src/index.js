'use strict'

const { Server: WebSocketServer } = require('ws')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const first = require('it-first')
const debug = require('debug')('ipfs:grpc-server')
const GRPCWebsocketMessages = require('./utils/messages')

const fromHeaders = require('./utils/from-headers')
const errCode = require('err-code')

const packageDefinition = protoLoader.loadSync(
  require.resolve('ipfs-grpc-protocol/src/root.proto'), {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: false,
    oneofs: true
  }
)

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
const {
  // @ts-ignore
  Root
} = protoDescriptor.ipfs

module.exports = async function createServer (ipfs, options = {}) {
  options = options || {}

  const config = await ipfs.config.getAll()
  const grpcAddr = config.Addresses.RPC
  const [,, host, , port] = grpcAddr.split('/')

  const server = new grpc.Server()
  server.addService(Root.service, {
    addAll: require('./core-api/add-all')(ipfs, options),
    id: require('./core-api/id')(ipfs, options)
  })

  debug(`starting ws server on ${host}:${port}`)

  const wss = new WebSocketServer({ host, port })

  wss.on('connection', function connection (ws, request) {
    ws.on('error', error => debug(`WebSocket Error: ${error.message}`))

    ws.once('message', async function incoming (buf) {
      debug('incoming message', buf)

      const headers = buf.toString('utf8')
        .trim()
        .split('\r\n')
        .map(s => s.split(':'))
        .reduce((acc, curr) => {
          acc[curr[0].trim()] = curr[1].trim()

          return acc
        }, {})

      delete headers['content-type']
      delete headers['x-grpc-web']

      // @ts-ignore
      const handler = server.handlers.get(request.url)
      const messages = new GRPCWebsocketMessages(ws, handler)

      debug('url', request.url)
      debug('headers', headers)

      if (!handler) {
        messages.sendTrailer(new Error(`Request path ${request.url} unimplemented`))
        messages.end()
        return
      }

      // send headers
      ws.send(Buffer.from([]))

      switch (handler.type) {
        case 'bidi':
          handler.func(messages.source, messages.sink, fromHeaders(headers))
            .catch(err => {
              messages.sendTrailer(err)
              messages.end()
            })

          for await (const output of messages.sink) {
            messages.sendMessage(output)
          }

          messages.end()
          break
        case 'unary':
          const request = await first(messages.source)

          handler.func(request, fromHeaders(headers), (err, res) => {
            if (err) {
              messages.sendTrailer(errCode(new Error(err.details), err.code, err))
            } else {
              messages.sendMessage(res)
            }

            messages.end()
          })
          break
        default:
          debug(`Invalid handler type ${handler.type}`)
          messages.end()
      }
    })
  })

  wss.on('error', error => debug(`WebSocket Server Error: ${error.message}`))

  return new Promise((resolve) => {
    wss.on('listening', () => {
      resolve({
        stop: () => {
          return new Promise((resolve) => {
            wss.close(() => resolve())
          })
        },
        multiaddr: `/ip4/${wss.address().address}/tcp/${wss.address().port}/ws`
      })
    })
  })
}
