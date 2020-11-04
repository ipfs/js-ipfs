'use strict'

// @ts-ignore
const pushable = require('it-pushable')
const EventEmitter = require('events').EventEmitter
const debug = require('debug')('ipfs:grpc-server')

// @ts-ignore
const bl = require('bl')

const WebsocketSignal = {
  START_SEND: 0,
  FINISH_SEND: 1
}

const HEADER_SIZE = 5
const TRAILER_BYTES = 128

class GRPCWebsocketMessages extends EventEmitter {
  constructor (ws, handler) {
    super()

    this._ws = ws
    this._handler = handler
    // @ts-ignore
    this._buffer = bl()

    // @ts-ignore
    this.source = pushable()

    // @ts-ignore
    this.sink = pushable()

    ws.on('message', (buf) => {
      debug('incoming message', buf)

      const flag = buf[0]

      if (flag === WebsocketSignal.FINISH_SEND) {
        debug('received finish send message')
        this.source.end()

        return
      }

      debug('adding to input buffer', buf.slice(1))

      this._buffer.append(buf.slice(1))

      debug('buffer length now', this._buffer.length)

      this._parseMessage()
    })

    ws.once('end', () => {
      debug('socket ended')
      this.source.end()
      this.sink.end()
    })
  }

  _parseMessage () {
    let offset = 0

    debug('trying to parse messages, buffer length', this._buffer.length)

    if (this._buffer.length < HEADER_SIZE) {
      return
    }

    const header = this._buffer.shallowSlice(offset, HEADER_SIZE + offset)
    const length = header.readInt32BE(1, 4)
    offset += HEADER_SIZE

    if (this._buffer.length < (length + offset)) {
      debug('not enough bytes for read message, waiting for more')
      return
    }

    const message = this._buffer.slice(offset, offset + length)

    this._buffer.consume(HEADER_SIZE + length)

    if ((header.readUInt8(0) & TRAILER_BYTES) === TRAILER_BYTES) {
      debug('trailer', message)
    } else {
      debug('serialized message', message)
      const deserialized = this._handler.deserialize(message)
      debug('deserialized message', deserialized)
      this.source.push(deserialized)
    }

    this._parseMessage()
  }

  sendMessage (message) {
    const response = this._handler.serialize(message)

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
    const trailers = {
      'grpc-status': err ? 1 : 0,
      'grpc-message': err ? err.message : undefined,
      'grpc-stack': err ? err.stack : undefined,
      'grpc-code': err ? err.code : undefined
    }
    const trailerBuffer = Buffer.from(
      Object.entries(trailers)
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n')
    )

    const trailer = new DataView(new ArrayBuffer(HEADER_SIZE))
    trailer.setUint8(0, 0x80)
    trailer.setUint32(1, trailerBuffer.byteLength)

    this._ws.send(
      Buffer.concat([
        new Uint8Array(trailer.buffer, trailer.byteOffset, trailer.byteLength),
        trailerBuffer
      ], trailer.byteLength + trailerBuffer.byteLength)
    )
  }

  end () {
    this.source.end()
    this.sink.end()
    this._ws.close()
  }
}

module.exports = GRPCWebsocketMessages
