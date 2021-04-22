/**
 * @template {Iterable<any>} T
 * @template U
 * @param {T|U} value
 * @returns {value is T}
 */
const isIterable = (value) =>
  // @ts-ignore
  value && value[Symbol.iterator]

/**
 * @template {AsyncIterable<any>} T
 * @template U
 * @param {T|U} value
 * @returns {value is T}
 */
const isAsyncIterable = value =>
  // @ts-ignore
  value && value[Symbol.asyncIterator]

module.exports = { isIterable, isAsyncIterable }
