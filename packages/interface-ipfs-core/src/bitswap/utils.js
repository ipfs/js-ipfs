'use strict'

const delay = require('delay')

async function waitForWantlistKey (ipfs, key, opts = {}) {
  opts.timeout = opts.timeout || 10000
  opts.interval = opts.interval || 100

  const end = Date.now() + opts.timeout

  while (Date.now() < end) {
    let list

    if (opts.peerId) {
      list = await ipfs.bitswap.wantlistForPeer(opts.peerId)
    } else {
      list = await ipfs.bitswap.wantlist()
    }

    if (list.some(cid => cid.toString() === key)) {
      return
    }

    await delay(opts.interval)
  }

  throw new Error(`Timed out waiting for ${key} in wantlist`)
}

async function waitForWantlistKeyToBeRemoved (ipfs, key, opts = {}) {
  opts.timeout = opts.timeout || 10000
  opts.interval = opts.interval || 100

  const end = Date.now() + opts.timeout

  while (Date.now() < end) {
    let list

    if (opts.peerId) {
      list = await ipfs.bitswap.wantlistForPeer(opts.peerId)
    } else {
      list = await ipfs.bitswap.wantlist()
    }

    if (list.some(cid => cid.toString() === key)) {
      await delay(opts.interval)

      continue
    }

    return
  }

  throw new Error(`Timed out waiting for ${key} to be removed from wantlist`)
}

module.exports.waitForWantlistKey = waitForWantlistKey
module.exports.waitForWantlistKeyToBeRemoved = waitForWantlistKeyToBeRemoved
