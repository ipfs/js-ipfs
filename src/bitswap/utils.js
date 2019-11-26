'use strict'

const pWhilst = require('p-whilst')

function waitForWantlistKey (ipfs, key, opts = {}) {
  opts.timeout = opts.timeout || 10000

  let list = { Keys: [] }

  const start = Date.now()
  const findKey = () => !list.Keys.some(k => k['/'] === key)

  const iteratee = async () => {
    if (Date.now() - start > opts.timeout) {
      throw new Error(`Timed out waiting for ${key} in wantlist`)
    }

    list = await ipfs.bitswap.wantlist(opts.peerId)
  }

  return pWhilst(findKey, iteratee)
}

module.exports.waitForWantlistKey = waitForWantlistKey
