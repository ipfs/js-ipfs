'use strict'

const promisify = require('promisify-es6')
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

module.exports = function mfsCp (ipfs) {
  return promisify(function () {
    const {
      callback
    } = toSources(Array.prototype.slice.call(arguments), defaultOptions)

    // remove the callback
    const cpArgs = Array.prototype.slice.call(arguments)
      .filter(arg => typeof arg !== 'function')

    // remove the last string in the args as it'll be the destination
    const lastStringIndex = cpArgs.reduce((acc, curr, index) => {
      if (typeof curr === 'string') {
        return index
      }

      return acc
    }, -1)
    const rmArgs = cpArgs
      .filter((arg, index) => index !== lastStringIndex)
      .slice(0, cpArgs.length - 1)

    series([
      (cb) => cp(ipfs).apply(null, cpArgs.concat(cb)),
      (cb) => rm(ipfs).apply(null, rmArgs.concat(cb))
    ], callback)
  })
}
