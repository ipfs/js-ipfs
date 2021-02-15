'use strict'

/**
 * @param {number | string | undefined} mode
 */
module.exports = (mode) => {
  if (mode == null) {
    return undefined
  }

  if (typeof mode === 'string') {
    return mode
  }

  return mode.toString(8).padStart(4, '0')
}
