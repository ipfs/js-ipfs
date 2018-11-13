'use strict'

const promisify = require('promisify-es6')
const cleanCID = require('../utils/clean-cid')
const TarStreamToObjects = require('../utils/tar-stream-to-objects')
const concat = require('concat-stream')
const through = require('through2')
const v = require('is-ipfs')

module.exports = (send) => {
  return promisify((path, opts, callback) => {
    if (typeof opts === 'function' && !callback) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' && typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    try {
      path = cleanCID(path)
    } catch (err) {
      if (!v.ipfsPath(path)) {
        return callback(err)
      }
    }

    const request = { path: 'get', args: path, qs: opts }

    // Convert the response stream to TarStream objects
    send.andTransform(request, TarStreamToObjects, (err, stream) => {
      if (err) { return callback(err) }

      const files = []

      stream.pipe(through.obj((file, enc, next) => {
        if (file.content) {
          file.content.pipe(concat((content) => {
            files.push({ path: file.path, content: content })
          }))
        } else {
          files.push(file)
        }
        next()
      }, () => callback(null, files)))
    })
  })
}
