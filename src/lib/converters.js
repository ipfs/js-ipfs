'use strict'

const toPull = require('async-iterator-to-pull-stream')
const all = require('async-iterator-all')
const toStream = require('it-to-stream')

exports.collectify = fn => (...args) => all(fn(...args))

exports.pullify = {
  source: fn => (...args) => toPull(fn(...args)),
  transform: fn => (...args) => toPull.transform(source => fn(source, ...args))
}

exports.streamify = {
  transform: fn => (...args) => toStream.transform(source => fn(source, ...args), { objectMode: true })
}
