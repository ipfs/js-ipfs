// @ts-check
'use strict'

const modeToString = require('./mode-to-string')

/**
 * @typedef {import('./mode-to-string').Mode} Mode
 */

/**
 * @param {Mode} mode
 * @returns {void|{mode:string}}
 */
const modeToHeaders = (mode) => {
  const value = modeToString(mode)
  if (value != null) {
    return { mode: value }
  } else {
    return undefined
  }
}

module.exports = modeToHeaders
