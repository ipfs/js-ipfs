'use strict'

const series = require('async/series')
const waterfall = require('async/waterfall')
const {
  toSources
} = require('./utils')
const cp = require('./cp')
const rm = require('./rm')

const defaultOptions = {
  parents: false,
  recursive: false,
  flush: true,
  format: 'dag-pb',
  hashAlg: 'sha2-256',
  shardSplitThreshold: 1000
}

module.exports = (context) => {
  return function mfsMv () {
    let args = Array.from(arguments)
    const callback = args.pop()

    if (Array.isArray(args[0])) {
      args = args[0].concat(args.slice(1))
    }

    waterfall([
      (cb) => toSources(context, args, defaultOptions, cb),
      ({ sources, options }, cb) => {
        // remove the callback
        const cpArgs = sources
          .map(source => source.path).concat(options)

        // remove the last source as it'll be the destination
        const rmArgs = sources
          .slice(0, -1)
          .map(source => source.path)
          .concat(Object.assign(options, {
            recursive: true
          }))

        series([
          (cb) => cp(context).apply(null, cpArgs.concat(cb)),
          (cb) => rm(context).apply(null, rmArgs.concat(cb))
        ], cb)
      }
    ], callback)
  }
}
