'use strict'

const delay = require('delay')

async function waitForWantlistKey (ipfs, key, opts = {}) {
  opts.timeout = opts.timeout || 10000
  opts.interval = opts.interval || 100

  const end = Date.now() + opts.timeout

  while (Date.now() < end) {
    const list = await ipfs.bitswap.wantlist(opts.peerId)

    if (list.some(cid => cid.toString() === key)) {
      return
    }

    await delay(opts.interval)
  }

  throw new Error(`Timed out waiting for ${key} in wantlist`)
}

module.exports.waitForWantlistKey = waitForWantlistKey
