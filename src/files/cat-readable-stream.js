'use strict'

const cleanCID = require('../utils/clean-cid')
const v = require('is-ipfs')
const Stream = require('readable-stream')
const pump = require('pump')

module.exports = (send) => {
  return (hash, opts) => {
    opts = opts || {}

    const pt = new Stream.PassThrough()

    try {
      hash = cleanCID(hash)
    } catch (err) {
      if (!v.ipfsPath(hash)) {
        return pt.destroy(err)
      }
    }

    send({ path: 'cat', args: hash, buffer: opts.buffer }, (err, stream) => {
      if (err) { return pt.destroy(err) }

      pump(stream, pt)
    })

    return pt
  }
}
