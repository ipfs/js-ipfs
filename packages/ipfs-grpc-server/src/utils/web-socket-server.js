'use strict'

const { Server: WebSocketServer } = require('ws')
const { EventEmitter } = require('events')
const WebSocketMessageChannel = require('./web-socket-message-channel')
const debug = require('debug')('ipfs:grpc-server:utils:web-socket-server')
const coerce = require('coercer')
const { camelCase } = require('change-case')

/**
 * @param {Buffer} buf - e.g. `Buffer.from('foo-bar: baz\r\n')`
 * @returns {object} - e.g. `{ foorBar: 'baz' }`
 **/
const fromHeaders = (buf) => {
  const headers = buf.toString('utf8')
    .trim()
    .split('\r\n')
    .map(s => s.split(':').map(s => s.trim()))
    .reduce((acc, curr) => {
      if (curr[0] !== 'content-type' && curr[0] !== 'x-grpc-web') {
        acc[camelCase(curr[0])] = curr[1]
      }

      return acc
    }, {})

  return coerce(headers)
}

class Messages extends EventEmitter {
  constructor (wss) {
    super()

    this._wss = wss
    this.multiaddr = ''

    wss.on('connection', (ws, request) => {
      ws.on('error', error => debug(`WebSocket Error: ${error.stack}`))

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
    return new Promise((resolve) => {
      this._wss.close(() => resolve())
    })
  }

  /**
   * @returns {Promise<Messages>}
   */
  ready () {
    return new Promise((resolve) => {
      this._wss.on('listening', () => {
        this.info = this._wss.address()
        this.info.uri = `http://${this.info.address}:${this.info.port}`
        this.multiaddr = `/ip4/${this._wss.address().address}/tcp/${this._wss.address().port}/ws`

        resolve(this)
      })
    })
  }
}

module.exports = async (ipfs, options = {}) => {
  const config = await ipfs.config.getAll()
  const grpcAddr = config.Addresses.RPC
  const [,, host, , port] = grpcAddr.split('/')

  debug(`starting ws server on ${host}:${port}`)

  const wss = new WebSocketServer({
    host,
    port
  })

  const messages = new Messages(wss)

  return messages.ready()
}
