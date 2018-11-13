'use strict'

const cleanCID = require('../utils/clean-cid')
const TarStreamToObjects = require('../utils/tar-stream-to-objects')
const v = require('is-ipfs')
const through = require('through2')
const pull = require('pull-stream')
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

      const files = []
      stream.pipe(through.obj((file, enc, next) => {
        if (file.content) {
          files.push({ path: file.path, content: toPull(file.content) })
        } else {
          files.push(file)
        }
        next()
      }, () => p.resolve(pull.values(files))))
    })

    return p
  }
}
