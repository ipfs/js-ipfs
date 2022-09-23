import { WebSocketServer } from 'ws'
import { EventEmitter } from 'events'
import { WebSocketMessageChannel } from './web-socket-message-channel.js'
import { logger } from '@libp2p/logger'
// @ts-expect-error - no types
import coerce from 'coercer'
import { camelCase } from 'change-case'
import { multiaddr } from '@multiformats/multiaddr'

const log = logger('ipfs:grpc-server:utils:web-socket-server')

/**
 * @param {import('ws').Data} buf - e.g. `Buffer.from('foo-bar: baz\r\n')`
 * @returns {Record<string, any>} - e.g. `{ foorBar: 'baz' }`
 **/
const fromHeaders = (buf) => {
  const headers = buf.toString('utf8')
    .trim()
    .split('\r\n')
    .map(s => s.split(':').map(s => s.trim()))
    .reduce((/** @type {Record<string, any> } */ acc, curr) => {
      if (curr[0] !== 'content-type' && curr[0] !== 'x-grpc-web') {
        acc[camelCase(curr[0])] = curr[1]
      }

      return acc
    }, {})

  return coerce(headers)
}

class Messages extends EventEmitter {
  /**
   * @param {WebSocketServer} wss
   */
  constructor (wss) {
    super()

    this._wss = wss
    this.multiaddr = ''

    this.info = {
      uri: '',
      ma: multiaddr('/ip4/127.0.0.1/tcp/0/ws')
    }

    wss.on('connection', (ws, request) => {
      ws.on('error', error => log(`WebSocket Error: ${error.stack}`))

      ws.once('message', (buf) => {
        const path = request.url
        const metadata = fromHeaders(buf)
        const channel = new WebSocketMessageChannel(ws)

        this.emit('data', {
          path,
          metadata,
          channel
        })
      })
    })

    wss.on('error', error => this.emit('error', error))
  }

  /**
   * @returns {Promise<void>}
   */
  stop () {
    return new Promise((resolve, reject) => {
      this._wss.close((err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  ready () {
    return new Promise((resolve) => {
      this._wss.on('listening', () => {
        const info = this._wss.address()

        if (typeof info === 'string') {
          // this is only the case when a net.Server is listening on a pipe or a unix domain socket
          // which is not how this server runs: https://nodejs.org/dist/latest-v15.x/docs/api/net.html#net_server_address
          this.info = {
            uri: info,
            ma: multiaddr(info)
          }
        } else {
          this.info = {
            uri: `http://${info.address}:${info.port}`,
            ma: multiaddr(`/ip4/${info.address}/tcp/${info.port}/ws`)
          }
        }

        resolve(this)
      })
    })
  }
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {any} options
 * @returns {Promise<import('../types').WebsocketServer>}
 */
export async function webSocketServer (ipfs, options = {}) {
  const config = await ipfs.config.getAll()
  const grpcAddr = config.Addresses?.RPC

  if (!grpcAddr) {
    throw new Error('No gRPC address configured, please set an Addresses.RPC key in your IPFS config')
  }

  const [,, host, , port] = grpcAddr.split('/')

  log(`starting ws server on ${host}:${port}`)

  const wss = new WebSocketServer({
    host,
    port: parseInt(port, 10)
  })

  const messages = new Messages(wss)

  return messages.ready()
}
