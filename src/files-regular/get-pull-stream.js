'use strict'

const cleanCID = require('../utils/clean-cid')
const TarStreamToObjects = require('../utils/tar-stream-to-objects')
const v = require('is-ipfs')
const pull = require('pull-stream/pull')
const map = require('pull-stream/throughs/map')
const toPull = require('stream-to-pull-stream')
const deferred = require('pull-defer')

module.exports = (send) => {
  return (path, opts) => {
    opts = opts || {}

    const p = deferred.source()

    try {
      path = cleanCID(path)
    } catch (err) {
      if (!v.ipfsPath(path)) {
        return p.end(err)
      }
    }

    const request = { path: 'get', args: path, qs: opts }

    // Convert the response stream to TarStream objects
    send.andTransform(request, TarStreamToObjects, (err, stream) => {
      if (err) { return p.end(err) }

      p.resolve(
        pull(
          toPull.source(stream),
          map(file => {
            const { path, content } = file
            return content ? { path, content: toPull.source(content) } : file
          })
        )
      )
    })

    return p
  }
}
