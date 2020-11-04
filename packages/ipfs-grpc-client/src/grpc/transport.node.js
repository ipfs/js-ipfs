'use strict'

// copied from https://github.com/improbable-eng/grpc-web/blob/master/client/grpc-web/src/transports/websocket/websocket.ts
// but uses the ws implementation of WebSockets
// see: https://github.com/improbable-eng/grpc-web/issues/796

const WebSocket = require('ws')
const debug = require('debug')('ipfs:grpc-client:websocket-transport')

const WebsocketSignal = {
  FINISH_SEND: 1
}

const finishSendFrame = new Uint8Array([1])

function WebsocketTransport () {
  return (opts) => {
    return websocketRequest(opts)
  }
}

function websocketRequest (options) {
  const webSocketAddress = constructWebSocketAddress(options.url)

  let sendQueue = []
  let ws

  function sendToWebsocket (toSend) {
    if (toSend === WebsocketSignal.FINISH_SEND) {
      ws.send(finishSendFrame)
    } else {
      const byteArray = toSend
      const c = new Int8Array(byteArray.byteLength + 1)
      c.set(new Uint8Array([0]))
      c.set(byteArray, 1)

      ws.send(c)
    }
  }

  return {
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
    start: (metadata) => {
      ws = new WebSocket(webSocketAddress, ['grpc-websockets'])
      ws.binaryType = 'arraybuffer'
      ws.onopen = function () {
        options.debug && debug('websocketRequest.onopen')
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
        options.debug && debug('websocketRequest.onerror', error)
      }

      ws.onmessage = function (e) {
        options.onChunk(new Uint8Array(e.data, 0, e.data.byteLength))
      }
    },
    cancel: () => {
      ws.close()
    }
  }
}

function constructWebSocketAddress (url) {
  if (url.startsWith('wss://') || url.startsWith('ws://')) {
    return url
  } else if (url.substr(0, 8) === 'https://') {
    return `wss://${url.substr(8)}`
  } else if (url.substr(0, 7) === 'http://') {
    return `ws://${url.substr(7)}`
  }
  throw new Error('Websocket transport constructed with non-https:// or http:// host.')
}

function headersToBytes (headers) {
  let asString = ''
  headers.forEach((key, values) => {
    asString += `${key}: ${values.join(', ')}\r\n`
  })
  return encodeASCII(asString)
}

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

const isAllowedControlChars = (char) => char === 0x9 || char === 0xa || char === 0xd

function isValidHeaderAscii (val) {
  return isAllowedControlChars(val) || (val >= 0x20 && val <= 0x7e)
}

module.exports = WebsocketTransport
