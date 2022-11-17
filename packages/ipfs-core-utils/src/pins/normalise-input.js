import errCode from 'err-code'
import { CID } from 'multiformats/cid'

/**
 * @typedef {object} Pinnable
 * @property {string | InstanceType<typeof window.String> | CID} [path]
 * @property {CID} [cid]
 * @property {boolean} [recursive]
 * @property {any} [metadata]
 *
 * @typedef {CID|string|InstanceType<typeof window.String>|Pinnable} ToPin
 * @typedef {ToPin|Iterable<ToPin>|AsyncIterable<ToPin>} Source
 *
 * @typedef {object} Pin
 * @property {string|CID} path
 * @property {boolean} recursive
 * @property {any} [metadata]
 */

/**
 * @param {any} thing
 * @returns {thing is IterableIterator<any> & Iterator<any>}
 */
function isIterable (thing) {
  return Symbol.iterator in thing
}

/**
 * @param {any} thing
 * @returns {thing is AsyncIterableIterator<any> & AsyncIterator<any>}
 */
function isAsyncIterable (thing) {
  return Symbol.asyncIterator in thing
}

/**
 * @param {any} thing
 * @returns {thing is CID}
 */
function isCID (thing) {
  return CID.asCID(thing) != null
}

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
 * @param {Source} input
 * @returns {AsyncIterable<Pin>}
 */
// eslint-disable-next-line complexity
export async function * normaliseInput (input) {
  // must give us something
  if (input === null || input === undefined) {
    throw errCode(new Error(`Unexpected input: ${input}`), 'ERR_UNEXPECTED_INPUT')
  }

  // CID
  const cid = CID.asCID(input)

  if (cid) {
    yield toPin({ cid })
    return
  }

  if (input instanceof String || typeof input === 'string') {
    yield toPin({ path: input })
    return
  }

  // { cid: CID recursive, metadata }
  // @ts-expect-error - it still could be iterable or async iterable
  if (input.cid != null || input.path != null) {
    // @ts-expect-error
    return yield toPin(input)
  }

  // Iterable<?>
  if (isIterable(input)) {
    const iterator = input[Symbol.iterator]()
    const first = iterator.next()

    if (first.done) {
      return iterator
    }

    // Iterable<CID>
    if (isCID(first.value)) {
      yield toPin({ cid: first.value })
      for (const cid of iterator) {
        yield toPin({ cid })
      }
      return
    }

    // Iterable<String>
    if (first.value instanceof String || typeof first.value === 'string') {
      yield toPin({ path: first.value })
      for (const path of iterator) {
        yield toPin({ path })
      }
      return
    }

    // Iterable<Pinnable>
    if (first.value.cid != null || first.value.path != null) {
      yield toPin(first.value)
      for (const obj of iterator) {
        yield toPin(obj)
      }
      return
    }

    throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
  }

  // AsyncIterable<?>
  if (isAsyncIterable(input)) {
    const iterator = input[Symbol.asyncIterator]()
    const first = await iterator.next()
    if (first.done) return iterator

    // AsyncIterable<CID>
    if (isCID(first.value)) {
      yield toPin({ cid: first.value })
      for await (const cid of iterator) {
        yield toPin({ cid })
      }
      return
    }

    // AsyncIterable<String>
    if (first.value instanceof String || typeof first.value === 'string') {
      yield toPin({ path: first.value })
      for await (const path of iterator) {
        yield toPin({ path })
      }
      return
    }

    // AsyncIterable<{ cid: CID|String recursive, metadata }>
    if (first.value.cid != null || first.value.path != null) {
      yield toPin(first.value)
      for await (const obj of iterator) {
        yield toPin(obj)
      }
      return
    }

    throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
  }

  throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
}

/**
 * @param {Pinnable} input
 */
function toPin (input) {
  const path = input.cid || `${input.path}`

  if (!path) {
    throw errCode(new Error('Unexpected input: Please path either a CID or an IPFS path'), 'ERR_UNEXPECTED_INPUT')
  }

  /** @type {Pin} */
  const pin = {
    path,
    recursive: input.recursive !== false
  }

  if (input.metadata != null) {
    pin.metadata = input.metadata
  }

  return pin
}
