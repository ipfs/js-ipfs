'use strict'

/**
 * @template T
 * @param {AsyncIterable<T>} input
 * @returns {Promise<T[]>}
 */
const collect = async input => {
  const values = []
  for await (const value of input) {
    values.push(value)
  }
  return values
}

exports.collect = collect
