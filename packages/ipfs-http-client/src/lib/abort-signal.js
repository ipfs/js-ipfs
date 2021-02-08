'use strict'

const { anySignal } = require('any-signal')

/**
 * @typedef {AbortSignal | undefined} MaybeSignal
 *
 * @param  {MaybeSignal[]} signals
 * @returns {AbortSignal[]}
 */
function filter (signals) {
  // @ts-ignore
  return signals.filter(Boolean)
}

/**
 * @param  {...AbortSignal|undefined} signals
 */
module.exports = (...signals) => {
  return anySignal(filter(signals))
}
