/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { PinTypes } = require('ipfs-repo')
const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const { resolvePath } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const errCode = require('err-code')

/**
 * @typedef {import('multiformats/cid').CID} CID
 */

/**
 * @param {string} type
 * @param {CID} cid
 * @param {Record<string, any>} [metadata]
 */
function toPin (type, cid, metadata) {
  /** @type {import('ipfs-core-types/src/pin').LsResult} */
  const output = {
    type,
    cid
  }

  if (metadata) {
    output.metadata = metadata
  }

  return output
}

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 */
module.exports = ({ repo, codecs }) => {
  /**
   * @type {import('ipfs-core-types/src/pin').API["ls"]}
   */
  async function * ls (options = {}) {
    /** @type {import('ipfs-core-types/src/pin').PinQueryType} */
    let type = PinTypes.all

    if (options.type) {
      type = options.type

      if (!Object.keys(PinTypes).includes(type)) {
        throw errCode(new Error('Invalid pin type'), 'ERR_INVALID_PIN_TYPE')
      }
    }

    if (options.paths) {
      // check the pinned state of specific hashes
      let matched = false

      for await (const { path } of normaliseInput(options.paths)) {
        const { cid } = await resolvePath(repo, codecs, path)
        const { reason, pinned, parent, metadata } = await repo.pins.isPinnedWithType(cid, type)

        if (!pinned) {
          throw errCode(new Error(`path '${path}' is not pinned`), 'ERR_NOT_PINNED')
        }

        switch (reason) {
          case PinTypes.direct:
          case PinTypes.recursive:
            matched = true
            yield toPin(reason, cid, metadata)
            break
          default:
            matched = true
            yield toPin(`${PinTypes.indirect} through ${parent}`, cid, metadata)
        }
      }

      if (!matched) {
        throw new Error('No match found')
      }

      return
    }

    if (type === PinTypes.recursive || type === PinTypes.all) {
      for await (const { cid, metadata } of repo.pins.recursiveKeys()) {
        yield toPin(PinTypes.recursive, cid, metadata)
      }
    }

    if (type === PinTypes.indirect || type === PinTypes.all) {
      // @ts-ignore - LsSettings & AbortOptions have no properties in common
      // with type { preload?: boolean }
      for await (const cid of repo.pins.indirectKeys(options)) {
        yield toPin(PinTypes.indirect, cid)
      }
    }

    if (type === PinTypes.direct || type === PinTypes.all) {
      for await (const { cid, metadata } of repo.pins.directKeys()) {
        yield toPin(PinTypes.direct, cid, metadata)
      }
    }
  }

  return withTimeoutOption(ls)
}
