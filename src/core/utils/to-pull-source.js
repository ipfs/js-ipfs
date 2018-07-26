'use strict'

const toPull = require('stream-to-pull-stream')
const isStream = require('is-stream')
const fileReaderStream = require('filereader-stream')
const isPullStream = require('is-pull-stream')
const fs = require('fs')
const values = require('pull-stream/sources/values')
const log = require('debug')('ipfs:mfs:utils:to-pull-source')
const waterfall = require('async/waterfall')

const toPullSource = (content, options, callback) => {
  if (!content) {
    return callback(new Error('paths must start with a leading /'))
  }

  // Buffers
  if (Buffer.isBuffer(content)) {
    log('Content was a buffer')

    options.length = options.length || content.length

    return callback(null, values([content]))
  }

  // Paths, node only
  if (typeof content === 'string' || content instanceof String) {
    log('Content was a path')

    // Find out the file size if options.length has not been specified
    return waterfall([
      (done) => options.length ? done(null, {
        size: options.length
      }) : fs.stat(content, done),
      (stats, done) => {
        options.length = stats.size

        done(null, toPull.source(fs.createReadStream(content)))
      }
    ], callback)
  }

  // HTML5 Blob objects (including Files)
  if (global.Blob && content instanceof global.Blob) {
    log('Content was an HTML5 Blob')
    options.length = options.length || content.size

    content = fileReaderStream(content)
  }

  // Node streams
  if (isStream(content)) {
    log('Content was a Node stream')
    return callback(null, toPull.source(content))
  }

  // Pull stream
  if (isPullStream.isSource(content)) {
    log('Content was a pull-stream')
    return callback(null, content)
  }

  callback(new Error(`Don't know how to convert ${content} into a pull stream source`))
}

module.exports = toPullSource
