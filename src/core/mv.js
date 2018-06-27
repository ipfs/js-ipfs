'use strict'

const series = require('async/series')
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
  hashAlg: 'sha2-256'
}

module.exports = (ipfs) => {
  return function mfsMv () {
    let args = Array.from(arguments)

    if (Array.isArray(args[0])) {
      args = args[0].concat(args.slice(1))
    }

    const {
      sources,
      options,
      callback
    } = toSources(args, defaultOptions)

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
      (cb) => cp(ipfs).apply(null, cpArgs.concat(cb)),
      (cb) => rm(ipfs).apply(null, rmArgs.concat(cb))
    ], callback)
  }
}
