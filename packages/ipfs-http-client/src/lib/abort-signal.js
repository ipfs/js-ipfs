import { anySignal } from 'any-signal'

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
export function abortSignal (...signals) {
  return anySignal(filter(signals))
}
