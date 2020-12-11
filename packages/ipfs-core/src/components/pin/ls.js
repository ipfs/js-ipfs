/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const PinManager = require('./pin-manager')
const { PinTypes } = PinManager
const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const { resolvePath } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

function toPin (type, cid, metadata) {
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
 * @param {import('.').PinManager} config.pinManager
 * @param {import('.').DagReader} config.dagReader
 */
module.exports = ({ pinManager, dagReader }) => {
  /**
   * List all the objects pinned to local storage
   *
   * @param {LsOptions} [options]
   * @returns {AsyncIterable<LsEntry>}
   * @example
   * ```js
   * for await (const { cid, type } of ipfs.pin.ls()) {
   *   console.log({ cid, type })
   * }
   * // { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
   * // { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
   * // { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
   *
   * const paths = [
   *   CID.from('Qmc5..'),
   *   CID.from('QmZb..'),
   *   CID.from('QmSo..')
   * ]
   * for await (const { cid, type } of ipfs.pin.ls({ paths })) {
   *   console.log({ cid, type })
   * }
   * // { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
   * // { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
   * // { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
   * ```
   */
  async function * ls (options = {}) {
    /** @type {PinQueryType} */
    let type = PinTypes.all

    if (options.type) {
      type = options.type
      if (typeof options.type === 'string') {
        // @ts-ignore - Can't infer that string returned by toLowerCase() is PinQueryType
        type = options.type.toLowerCase()
      }

      PinManager.checkPinType(type)
    } else {
      options.type = PinTypes.all
    }

    if (options.paths) {
      // check the pinned state of specific hashes
      let matched = false

      for await (const { path } of normaliseInput(options.paths)) {
        const cid = await resolvePath(dagReader, path)
        const { reason, pinned, parent, metadata } = await pinManager.isPinnedWithType(cid, type)

        if (!pinned) {
          throw new Error(`path '${path}' is not pinned`)
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
      for await (const { cid, metadata } of pinManager.recursiveKeys()) {
        yield toPin(PinTypes.recursive, cid, metadata)
      }
    }

    if (type === PinTypes.indirect || type === PinTypes.all) {
      // @ts-ignore - LsSettings & AbortOptions have no properties in common
      // with type { preload?: boolean }
      for await (const cid of pinManager.indirectKeys(options)) {
        yield toPin(PinTypes.indirect, cid)
      }
    }

    if (type === PinTypes.direct || type === PinTypes.all) {
      for await (const { cid, metadata } of pinManager.directKeys()) {
        yield toPin(PinTypes.direct, cid, metadata)
      }
    }
  }

  return withTimeoutOption(ls)
}

/**
 * @typedef {LsSettings & AbortOptions} LsOptions
 *
 * @typedef {Object} LsSettings
 * @property {string[]|CID[]} [paths] - CIDs or IPFS paths to search for in the pinset.
 * @property {PinQueryType} [type] - Filter by this type of pin ("recursive", "direct" or "indirect")
 *
 * @typedef {Object} LsEntry
 * @property {CID} cid -  CID of the pinned node
 * @property {PinType} type -  Pin type ("recursive", "direct" or "indirect")
 *
 * @typedef {import('./pin-manager').PinType} PinType
 * @typedef {import('./pin-manager').PinQueryType} PinQueryType
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('.').CID} CID
 */
