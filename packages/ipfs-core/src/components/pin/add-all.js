/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { resolvePath } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const { PinTypes } = require('ipfs-repo')

/**
 * @typedef {import('ipfs-core-utils/src/pins/normalise-input').Source} Source
 * @typedef {import('ipfs-core-utils/src/pins/normalise-input').Pin} PinTarget
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('multiformats/cid').CID} CID
 */

/**
 * @template T
 * @typedef {Iterable<T>|AsyncIterable<T>} AwaitIterable
 */

/**
 * @param {Object} config
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
module.exports = ({ repo, codecs }) => {
  /**
   * @type {import('ipfs-core-types/src/pin').API["addAll"]}
   */
  async function * addAll (source, options = {}) {
    /**
     * @returns {AsyncIterable<CID>}
     */
    const pinAdd = async function * () {
      for await (const { path, recursive, metadata } of normaliseInput(source)) {
        const { cid } = await resolvePath(repo, codecs, path)

        // verify that each hash can be pinned
        const { reason } = await repo.pins.isPinnedWithType(cid, [PinTypes.recursive, PinTypes.direct])

        if (reason === 'recursive' && !recursive) {
          // only disallow trying to override recursive pins
          throw new Error(`${cid} already pinned recursively`)
        }

        if (recursive) {
          await repo.pins.pinRecursively(cid, { metadata })
        } else {
          await repo.pins.pinDirectly(cid, { metadata })
        }

        yield cid
      }
    }

    // When adding a file, we take a lock that gets released after pinning
    // is complete, so don't take a second lock here
    const lock = Boolean(options.lock)

    if (!lock) {
      yield * pinAdd()
      return
    }

    const release = await repo.gcLock.readLock()

    try {
      yield * pinAdd()
    } finally {
      release()
    }
  }

  return withTimeoutOption(addAll)
}
