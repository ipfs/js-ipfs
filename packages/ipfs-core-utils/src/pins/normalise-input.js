'use strict'

const errCode = require('err-code')
const CID = require('cids')
const { isIterable, isAsyncIterable } = require('../iterable')

/**
 * @typedef {Object} Pinnable
 * @property {string | InstanceType<typeof window.String> | CID} [path]
 * @property {CID} [cid]
 * @property {boolean} [recursive]
 * @property {any} [metadata]
 *
 * @typedef {CID|string|InstanceType<typeof window.String>|Pinnable} ToPin
 * @typedef {ToPin|Iterable<ToPin>|AsyncIterable<ToPin>} Source
 *
 * @typedef {Object} Pin
 * @property {string|CID} path
 * @property {boolean} recursive
 * @property {any} [metadata]
 */

/**
 * Transform one of:
 *
 * ```ts
 * CID
 * String
 * { cid: CID recursive, metadata }
 * { path: String recursive, metadata }
 * Iterable<CID>
 * Iterable<String>
 * Iterable<{ cid: CID recursive, metadata }>
 * Iterable<{ path: String recursive, metadata }>
 * AsyncIterable<CID>
 * AsyncIterable<String>
 * AsyncIterable<{ cid: CID recursive, metadata }>
 * AsyncIterable<{ path: String recursive, metadata }>
 * ```
 * Into:
 *
 * ```ts
 * AsyncIterable<{ path: CID|String, recursive:boolean, metadata }>
 * ```
 *
 * @param {import('ipfs-core-types/src/pin').ToPin|import('ipfs-core-types/src/pin').PinSource} input
 * @returns {AsyncIterable<import('ipfs-core-types/src/pin').ToPinWithPath>}
 */
async function * normaliseInput (input) {
  // must give us something
  if (input === null || input === undefined) {
    throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
  }

  // CID|String
  if (CID.isCID(input) || typeof input === 'string' || input instanceof String) {
    return yield toPin(input)
  }

  // Iterable<?>
  if (isIterable(input)) {
    for (const each of input) {
      yield toPin(each)
    }
    return
  }

  // AsyncIterable<?>
  if (isAsyncIterable(input)) {
    for await (const each of input) {
      yield toPin(each)
    }
    return
  }

  // { cid: CID recursive, metadata }
  // @ts-ignore - it still could be iterable or async iterable
  if (input.cid != null || input.path != null) {
    // @ts-ignore
    return yield toPin(input)
  }

  throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
}

/**
 * @param {import('ipfs-core-types/src/pin').ToPin | InstanceType<typeof window.String>} input
 * @param {{recursive?:boolean}} [options]
 * @returns {import('ipfs-core-types/src/pin').ToPinWithPath}
 */
const toPin = (input, options) => {
  if (typeof input === 'string') {
    return { path: input, ...options }
  } else if (input instanceof String) {
    return { path: input.toString(), ...options }
  } else if (CID.isCID(input)) {
    return { path: input.toString(), ...options }
  } else {
    return {
      path: `${input.path == null ? input.cid : input.path}`,
      recursive: input.recursive !== false,
      ...(input.metadata && { metadata: input.metadata })
    }
  }
}

module.exports = {
  normaliseInput,
  toPin
}
