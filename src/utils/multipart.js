'use strict'

const Transform = require('stream').Transform
const isNode = require('detect-node')
const isSource = require('is-pull-stream').isSource
const toStream = require('pull-stream-to-stream')

const PADDING = '--'
const NEW_LINE = '\r\n'
const NEW_LINE_BUFFER = Buffer.from(NEW_LINE)

class Multipart extends Transform {
  constructor (options) {
    super(Object.assign({}, options, { objectMode: true, highWaterMark: 1 }))

    this._boundary = this._generateBoundary()
    this._files = []
    this._draining = false
  }

  _flush () {
    this.push(Buffer.from(PADDING + this._boundary + PADDING + NEW_LINE))
    this.push(null)
  }

  _generateBoundary () {
    var boundary = '--------------------------'
    for (var i = 0; i < 24; i++) {
      boundary += Math.floor(Math.random() * 10).toString(16)
    }

    return boundary
  }

  _transform (file, encoding, callback) {
    if (Buffer.isBuffer(file)) {
      this.push(file)
      return callback() // early
    }
    // not a buffer, must be a file
    this._files.push(file)
    this._maybeDrain(callback)
  }

  _maybeDrain (callback) {
    if (!this._draining) {
      if (this._files.length) {
        this._draining = true
        const file = this._files.shift()
        this._pushFile(file, (err) => {
          this._draining = false
          if (err) {
            this.emit('error', err)
          } else {
            this._maybeDrain(callback)
          }
        })
      } else {
        this.emit('drained all files')
        callback()
      }
    } else {
      this.once('drained all files', callback)
    }
  }

  _pushFile (file, callback) {
    const leading = this._leading(file.headers || {})

    this.push(leading)

    let content = file.content || Buffer.alloc(0)

    if (Buffer.isBuffer(content)) {
      this.push(content)
      this.push(NEW_LINE_BUFFER)
      return callback() // early
    }

    if (isSource(content)) {
      content = toStream.source(content)
    }

    // From now on we assume content is a stream

    content.once('error', this.emit.bind(this, 'error'))

    content.once('end', () => {
      this.push(NEW_LINE_BUFFER)
      callback()

      // TODO: backpressure!!! wait once self is drained so we can proceed
      // This does not work
      // this.once('drain', () => {
      //   callback()
      // })
    })

    content.on('data', (data) => {
      const drained = this.push(data)
      // Only do the drain dance on Node.js.
      // In browserland, the underlying stream
      // does NOT drain because the request is only sent
      // once this stream ends.
      if (!drained && isNode) {
        content.pause()
        this.once('drain', () => content.resume())
      }
    })
  }

  _leading (headers) {
    var leading = [PADDING + this._boundary]

    Object.keys(headers).forEach((header) => {
      leading.push(header + ': ' + headers[header])
    })

    leading.push('')
    leading.push('')

    const leadingStr = leading.join(NEW_LINE)

    return Buffer.from(leadingStr)
  }
}

module.exports = Multipart
