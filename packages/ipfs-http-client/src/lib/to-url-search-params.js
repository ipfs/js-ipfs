'use strict'

const modeToString = require('./mode-to-string')
const { parseMtime } = require('ipfs-unixfs')

/**
 * @param {*} params
 * @returns {URLSearchParams}
 */
module.exports = ({ arg, searchParams, hashAlg, mtime, mode, ...options } = {}) => {
  if (searchParams) {
    options = {
      ...options,
      ...searchParams
    }
  }

  if (hashAlg) {
    options.hash = hashAlg
  }

  if (mtime != null) {
    mtime = parseMtime(mtime)

    options.mtime = mtime.secs
    options.mtimeNsecs = mtime.nsecs
  }

  if (mode != null) {
    options.mode = modeToString(mode)
  }

  if (options.timeout && !isNaN(options.timeout)) {
    // server API expects timeouts as strings
    options.timeout = `${options.timeout}ms`
  }

  if (arg === undefined || arg === null) {
    arg = []
  } else if (!Array.isArray(arg)) {
    arg = [arg]
  }

  const urlSearchParams = new URLSearchParams(options)

  arg.forEach((/** @type {any} */ arg) => urlSearchParams.append('arg', arg))

  return urlSearchParams
}
