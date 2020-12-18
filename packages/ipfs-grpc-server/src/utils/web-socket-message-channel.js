'use strict'

// @ts-ignore
const pushable = require('it-pushable')
const { paramCase } = require('change-case')

const WebsocketSignal = {
  START_SEND: 0,
  FINISH_SEND: 1
}

const HEADER_SIZE = 5
const TRAILER_BYTES = 0x80

/**
 * @param {object} object - key/value pairs to turn into HTTP headers
 * @returns {Uint8Array} - HTTP headers
 **/
const objectToHeaders = (object) => {
  const output = {}

  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'function') {
      return
    }

    output[paramCase(key)] = object[key]
  })

  return Buffer.from(
    Object.entries(object)
      .filter(([, value]) => value != null)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\r\n')
  )
}

class WebsocketMessageChannel {
  constructor (ws) {
    this._ws = ws

    this.handler = {
      deserialize: (buf) => ({}),
      serialize: (message) => Buffer.from([])
    }

    // @ts-ignore
    this.source = pushable()

    // @ts-ignore
    this.sink = pushable()

    ws.on('message', (buf) => {
      const flag = buf[0]

      if (flag === WebsocketSignal.FINISH_SEND) {
        this.source.end()

        return
      }

      let offset = 1

      if (buf.length < (HEADER_SIZE + offset)) {
        return
      }

      const header = buf.slice(offset, HEADER_SIZE + offset)
      const length = header.readUInt32BE(1, 4)
      offset += HEADER_SIZE

      if (buf.length < (length + offset)) {
        return
      }

      const message = buf.slice(offset, offset + length)
      const deserialized = this.handler.deserialize(message)
      this.source.push(deserialized)
    })

    ws.once('end', () => {
      this.source.end()
      this.sink.end()
    })
  }

  sendMetadata (metadata) {
    this._ws.send(objectToHeaders(metadata))
  }

  /**
   * @param {object} message - A message object to send to the client
   * @returns {void}
   */
  sendMessage (message) {
    const response = this.handler.serialize(message)

    const header = new DataView(new ArrayBuffer(HEADER_SIZE))
    header.setUint32(1, response.byteLength)

    this._ws.send(
      Buffer.concat([
        new Uint8Array(header.buffer, header.byteOffset, header.byteLength),
        response
      ], header.byteLength + response.byteLength)
    )

    this.sendTrailer()
  }

  sendTrailer (err) {
    const trailerBuffer = objectToHeaders({
      'grpc-status': err ? 1 : 0,
      'grpc-message': err ? err.message : undefined,
      'grpc-stack': err ? err.stack : undefined,
      'grpc-code': err ? err.code : undefined
    })

    const trailer = new DataView(new ArrayBuffer(HEADER_SIZE))
    trailer.setUint8(0, TRAILER_BYTES)
    trailer.setUint32(1, trailerBuffer.byteLength)

    this._ws.send(
      Buffer.concat([
        new Uint8Array(trailer.buffer, trailer.byteOffset, trailer.byteLength),
        trailerBuffer
      ], trailer.byteLength + trailerBuffer.byteLength)
    )
  }

  end (err) {
    this.sendTrailer(err)
    this.source.end()
    this.sink.end()
    this._ws.close()
  }
}

module.exports = WebsocketMessageChannel
