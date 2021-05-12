'use strict'

const { anySignal } = require('any-signal')

/**
 * @param {any[]} signals
 * @returns {AbortSignal[]}
 */
function filter (signals) {
  return signals.filter(Boolean)
}

/**
 * @param  {...AbortSignal|undefined} signals
 */
module.exports = (...signals) => {
  return anySignal(filter(signals))
}
