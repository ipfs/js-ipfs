// @ts-check
'use strict'

/**
 * @typedef {import('ipfs-core-utils/src/files/normalise-input').Mode} Mode
 */

/**
 * @param {undefined|null|Mode} mode
 * @returns {undefined|string}
 */
module.exports = (mode) => {
  if (mode === undefined || mode === null) {
    return undefined
  }

  if (typeof mode === 'string') {
    return mode
  }

  if (mode instanceof String) {
    return mode.toString()
  }

  return mode.toString(8).padStart(4, '0')
}
