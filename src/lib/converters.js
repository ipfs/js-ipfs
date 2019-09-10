'use strict'

const toPull = require('async-iterator-to-pull-stream')
const all = require('async-iterator-all')
const toStream = require('it-to-stream')
const { Buffer } = require('buffer')

exports.collectify = fn => (...args) => all(fn(...args))

exports.concatify = fn => async (...args) => Buffer.concat(await all(fn(...args)))

exports.pullify = {
  source: fn => (...args) => toPull(fn(...args)),
  transform: fn => (...args) => toPull.transform(source => fn(source, ...args))
}

exports.streamify = {
  readable: fn => (...args) => toStream(fn(...args), { objectMode: true }),
  transform: fn => (...args) => toStream.transform(source => fn(source, ...args), { objectMode: true })
}
