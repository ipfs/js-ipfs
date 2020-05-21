'use strict'

const debug = require('debug')

/**
 * @typedef {import("debug").Debugger} Debugger
 * @typedef {Debugger & {error:Debugger}} ExtendedDebugger
 */

/**
 * @param {string} namespace
 * @returns {ExtendedDebugger}
 */
module.exports = (namespace) => {
  /** @type {ExtendedDebugger} */
  // @ts-ignore - TS can't infer type change caused by mutation below
  const log = debug(namespace)
  log.error = debug(namespace + ':error')
  return log
}
