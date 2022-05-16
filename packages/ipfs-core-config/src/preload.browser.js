/* eslint-env browser */

import HTTP from 'ipfs-utils/src/http.js'
import { logger } from '@libp2p/logger'
import PQueue from 'p-queue'

const log = logger('ipfs:preload')

// @ts-expect-error PQueue@6 is broken
const Queue = PQueue.default ? PQueue.default : PQueue

// browsers limit concurrent connections per host,
// we don't want preload calls to exhaust the limit (~6)
const httpQueue = new Queue({ concurrency: 4 })

/**
 * @param {string} url
 * @param {import('ipfs-core-types/src/utils').AbortOptions} options
 */
export function preload (url, options = {}) {
  log(url)

  return httpQueue.add(async () => {
    const res = await HTTP.post(url, { signal: options.signal })

    // @ts-expect-error
    const reader = res.body.getReader()

    try {
      while (true) {
        const { done } = await reader.read()
        if (done) return
        // Read to completion but do not cache
      }
    } finally {
      reader.releaseLock()
    }
  })
}
