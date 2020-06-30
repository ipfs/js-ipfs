'use strict'

const errCode = require('err-code')
const CID = require('cids')

/*
 * Transform one of:
 *
 * ```
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
 * ```
 * AsyncIterable<{ path: CID|String, recursive, metadata }>
 * ```
 *
 * @param input Object
 * @return AsyncIterable<{ path: CID|String, recursive, metadata }>
 */
module.exports = function normaliseInput (input) {
  // must give us something
  if (input === null || input === undefined) {
    throw errCode(new Error(`Unexpected input: ${input}`, 'ERR_UNEXPECTED_INPUT'))
  }

  // CID|String
  if (CID.isCID(input) || input instanceof String || typeof input === 'string') {
    return (async function * () { // eslint-disable-line require-await
      yield toPin({ cid: input })
    })()
  }

  // { cid: CID recursive, metadata }
  if (input.cid != null || input.path != null) {
    return (async function * () { // eslint-disable-line require-await
      yield toPin(input)
    })()
  }

  // Iterable<?>
  if (input[Symbol.iterator]) {
    return (async function * () { // eslint-disable-line require-await
      const iterator = input[Symbol.iterator]()
      const first = iterator.next()
      if (first.done) return iterator

      // Iterable<CID|String>
      if (CID.isCID(first.value) || first.value instanceof String || typeof first.value === 'string') {
        yield toPin({ cid: first.value })
        for (const cid of iterator) {
          yield toPin({ cid })
        }
        return
      }

      // Iterable<{ cid: CID recursive, metadata }>
      if (first.value.cid != null || first.value.path != null) {
        yield toPin(first.value)
        for (const obj of iterator) {
          yield toPin(obj)
        }
        return
      }

      throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
    })()
  }

  // AsyncIterable<?>
  if (input[Symbol.asyncIterator]) {
    return (async function * () {
      const iterator = input[Symbol.asyncIterator]()
      const first = await iterator.next()
      if (first.done) return iterator

      // AsyncIterable<CID|String>
      if (CID.isCID(first.value) || first.value instanceof String || typeof first.value === 'string') {
        yield toPin({ cid: first.value })
        for await (const cid of iterator) {
          yield toPin({ cid })
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
    })()
  }

  throw errCode(new Error('Unexpected input: ' + typeof input), 'ERR_UNEXPECTED_INPUT')
}

function toPin (input) {
  const pin = {
    path: input.cid || input.path,
    recursive: input.recursive !== false
  }

  if (input.metadata != null) {
    pin.metadata = input.metadata
  }

  return pin
}
