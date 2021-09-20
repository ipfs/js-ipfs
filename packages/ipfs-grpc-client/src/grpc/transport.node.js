// copied from https://github.com/improbable-eng/grpc-web/blob/master/client/grpc-web/src/transports/websocket/websocket.ts
// but uses the ws implementation of WebSockets
// see: https://github.com/improbable-eng/grpc-web/issues/796
import WebSocket from 'ws'
import debug from 'debug'

const log = debug('ipfs:grpc-client:websocket-transport')

/**
 * @typedef {import('http').Agent} HttpAgent
 * @typedef {import('https').Agent} HttpsAgent
 */

const WebsocketSignal = {
  FINISH_SEND: 1
}

const finishSendFrame = new Uint8Array([1])

/**
 * @param {object} options
 * @param {HttpAgent|HttpsAgent} [options.agent] - http.Agent used to control HTTP client behaviour
 */
function WebsocketTransport (options) {
  /**
   * @param {import('@improbable-eng/grpc-web').grpc.TransportOptions} opts
   */
  const websocketTransportFactory = (opts) => {
    return websocketRequest({
      ...options,
      ...opts
    })
  }

  return websocketTransportFactory
}

/**
 * @typedef {object} NodeTransportOptions
 * @property {HttpAgent|HttpsAgent} [options.agent]
 *
 * @typedef {NodeTransportOptions & import('@improbable-eng/grpc-web').grpc.TransportOptions} WebSocketTransportOptions
 *
 * @param {WebSocketTransportOptions} options
 */
function websocketRequest (options) {
  const webSocketAddress = constructWebSocketAddress(options.url)

  /** @type {Array<number | Uint8Array>} */
  let sendQueue = []
  /** @type {WebSocket} */
  let ws

  /**
   * @param {number | Uint8Array} toSend
   */
  function sendToWebsocket (toSend) {
    if (toSend === WebsocketSignal.FINISH_SEND) {
      ws.send(finishSendFrame)
    } else if (toSend instanceof Uint8Array) {
      const byteArray = toSend
      const c = new Int8Array(byteArray.byteLength + 1)
      c.set(new Uint8Array([0]))
      c.set(byteArray, 1)

      ws.send(c)
    }
  }

  return {
    /**
     * @param {Uint8Array} msgBytes
     */
    sendMessage: (msgBytes) => {
      if (!ws || ws.readyState === ws.CONNECTING) {
        sendQueue.push(msgBytes)
      } else {
        sendToWebsocket(msgBytes)
      }
    },
    finishSend: () => {
      if (!ws || ws.readyState === ws.CONNECTING) {
        sendQueue.push(WebsocketSignal.FINISH_SEND)
      } else {
        sendToWebsocket(WebsocketSignal.FINISH_SEND)
      }
    },
    /**
     * @param {import('@improbable-eng/grpc-web').grpc.Metadata} metadata
     */
    start: (metadata) => {
      ws = new WebSocket(webSocketAddress, ['grpc-websockets'], options)
      ws.binaryType = 'arraybuffer'
      ws.onopen = function () {
        options.debug && log('websocketRequest.onopen')
        ws.send(headersToBytes(metadata))

        // send any messages that were passed to sendMessage before the connection was ready
        sendQueue.forEach(toSend => {
          sendToWebsocket(toSend)
        })
        sendQueue = []
      }

      ws.onclose = function (closeEvent) {
        options.onEnd()
      }

      ws.onerror = function (error) {
        options.debug && log('websocketRequest.onerror', error)
      }

      ws.onmessage = function (e) {
        if (e.data instanceof ArrayBuffer) {
          options.onChunk(new Uint8Array(e.data, 0, e.data.byteLength))
        } else {
          options.onEnd(new Error(`Incorrect message type received - expected ArrayBuffer, got ${typeof e.data}`))
          ws.close()
        }
      }
    },
    cancel: () => {
      ws.close()
    }
  }
}

/**
 * @param {string} url
 */
function constructWebSocketAddress (url) {
  if (url.startsWith('wss://') || url.startsWith('ws://')) {
    return url
  } else if (url.substr(0, 8) === 'https://') {
    return `wss://${url.substr(8)}`
  } else if (url.substr(0, 7) === 'http://') {
    return `ws://${url.substr(7)}`
  }

  throw new Error('Websocket transport url must start with ws:// or wss:// or http:// or https://')
}

/**
 * TODO: type properly after https://github.com/ipfs/js-ipfs/issues/3594
 *
 * @param {import('@improbable-eng/grpc-web').grpc.Metadata} headers
 */
function headersToBytes (headers) {
  let asString = ''
  headers.forEach((key, values) => {
    asString += `${key}: ${values.join(', ')}\r\n`
  })
  return encodeASCII(asString)
}

/**
 * @param {string} input
 */
function encodeASCII (input) {
  const encoded = new Uint8Array(input.length)
  for (let i = 0; i !== input.length; ++i) {
    const charCode = input.charCodeAt(i)
    if (!isValidHeaderAscii(charCode)) {
      throw new Error('Metadata contains invalid ASCII')
    }
    encoded[i] = charCode
  }
  return encoded
}

/**
 * @param {number} char
 */
const isAllowedControlChars = (char) => char === 0x9 || char === 0xa || char === 0xd

/**
 * @param {number} val
 */
function isValidHeaderAscii (val) {
  return isAllowedControlChars(val) || (val >= 0x20 && val <= 0x7e)
}

export const transport = () => WebsocketTransport
