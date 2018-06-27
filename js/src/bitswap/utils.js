'use strict'

const until = require('async/until')

function waitForWantlistKey (ipfs, key, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  opts.timeout = opts.timeout || 1000

  let list = { Keys: [] }
  let timedOut = false

  setTimeout(() => { timedOut = true }, opts.timeout)

  const test = () => timedOut ? true : list.Keys.every(k => k['/'] === key)
  const iteratee = (cb) => ipfs.bitswap.wantlist(opts.peerId, cb)

  until(test, iteratee, (err) => {
    if (err) return cb(err)
    if (timedOut) return cb(new Error(`Timed out waiting for ${key} in wantlist`))
    cb()
  })
}

module.exports.waitForWantlistKey = waitForWantlistKey
