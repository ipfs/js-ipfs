'use strict'

const pump = require('pump')
const TransformStream = require('readable-stream').Transform
const streamToValue = require('./stream-to-value')
const getDagNode = require('./get-dagnode')

/*
  Transforms a stream of {Name, Hash} objects to include size
  of the DAG object.

  Usage: inputStream.pipe(DAGNodeStream({ send: send }))

  Input object format:
  {
    Name: '/path/to/file/foo.txt',
    Hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
  }

  Output object format:
  {
    path: '/path/to/file/foo.txt',
    hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    size: 20
  }
*/
class DAGNodeStream extends TransformStream {
  constructor (options) {
    const opts = Object.assign(options || {}, { objectMode: true })
    super(opts)
    this._send = opts.send
  }

  static streamToValue (send, inputStream, callback) {
    const outputStream = pump(inputStream, new DAGNodeStream({ send: send }), (err) => {
      if (err) {
        callback(err)
      }
    })
    streamToValue(outputStream, callback)
  }

  _transform (obj, enc, callback) {
    getDagNode(this._send, obj.Hash, (err, node) => {
      if (err) {
        return callback(err)
      }

      const result = {
        path: obj.Name,
        hash: obj.Hash,
        size: node.size
      }

      this.push(result)
      callback(null)
    })
  }
}

module.exports = DAGNodeStream
