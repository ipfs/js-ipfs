'use strict'

const modeToString = require('./mode-to-string')
const { mtimeToObject } = require('ipfs-core-utils/src/files/normalise-input/utils')

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
    mtime = mtimeToObject(mtime)

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

  arg.forEach(arg => urlSearchParams.append('arg', arg))

  return urlSearchParams
}
