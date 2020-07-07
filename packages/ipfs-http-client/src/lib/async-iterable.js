// @ts-check
'use strict'

/**
 * @template T
 * @param {Iterable<T>|AsyncIterable<T>} iterable
 * @returns {AsyncIterable<T>}
 */
// eslint-disable-next-line require-await
const from = async function * AsyncIterableFrom (iterable) {
  yield * iterable
}
exports.from = from

/**
 * @template T
 * @param  {...T} items
 * @returns {AsyncIterable<T>}
 */
// eslint-disable-next-line require-await
const of = async function * AsyncIterableOf (...items) {
  yield * items
}
exports.of = of
