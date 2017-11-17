'use strict'

const cleanCID = require('../utils/clean-cid')
const v = require('is-ipfs')
const toPull = require('stream-to-pull-stream')
const deferred = require('pull-defer')

module.exports = (send) => {
  return (hash, opts) => {
    opts = opts || {}

    const p = deferred.source()

    try {
      hash = cleanCID(hash)
    } catch (err) {
      if (!v.ipfsPath(hash)) {
        return p.end(err)
      }
    }

    send({ path: 'cat', args: hash, buffer: opts.buffer }, (err, stream) => {
      if (err) { return p.end(err) }

      p.resolve(toPull(stream))
    })

    return p
  }
}
