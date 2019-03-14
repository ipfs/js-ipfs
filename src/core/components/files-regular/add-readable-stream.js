'use strict'

const pull = require('pull-stream')
const pushable = require('pull-pushable')
const Duplex = require('readable-stream').Duplex

class AddHelper extends Duplex {
  constructor (pullStream, push, options) {
    super(Object.assign({ objectMode: true }, options))
    this._pullStream = pullStream
    this._pushable = push
    this._waitingPullFlush = []
  }

  _read () {
    this._pullStream(null, (end, data) => {
      while (this._waitingPullFlush.length) {
        const cb = this._waitingPullFlush.shift()
        cb()
      }
      if (end) {
        if (end instanceof Error) {
          this.emit('error', end)
        } else {
          this.push(null)
        }
      } else {
        this.push(data)
      }
    })
  }

  _write (chunk, encoding, callback) {
    this._waitingPullFlush.push(callback)
    this._pushable.push(chunk)
  }
}

module.exports = function (self) {
  return (options) => {
    options = options || {}

    const p = pushable()
    const s = pull(
      p,
      self.addPullStream(options)
    )

    const retStream = new AddHelper(s, p)

    retStream.once('finish', () => p.end())

    return retStream
  }
}
