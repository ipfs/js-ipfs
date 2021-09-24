import { modeToString } from './mode-to-string.js'
import { parseMtime } from '../lib/parse-mtime.js'

/**
 * @param {*} params
 * @returns {URLSearchParams}
 */
export function toUrlSearchParams ({ arg, searchParams, hashAlg, mtime, mode, ...options } = {}) {
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
