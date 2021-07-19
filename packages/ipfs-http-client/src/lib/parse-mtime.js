'use strict'

const errCode = require('err-code')

/**
 * @param {any} input
 */
function parseMtime (input) {
  if (input == null) {
    return undefined
  }

  /** @type {{ secs: number, nsecs?: number } | undefined} */
  let mtime

  // { secs, nsecs }
  if (input.secs != null) {
    mtime = {
      secs: input.secs,
      nsecs: input.nsecs
    }
  }

  // UnixFS TimeSpec
  if (input.Seconds != null) {
    mtime = {
      secs: input.Seconds,
      nsecs: input.FractionalNanoseconds
    }
  }

  // process.hrtime()
  if (Array.isArray(input)) {
    mtime = {
      secs: input[0],
      nsecs: input[1]
    }
  }

  // Javascript Date
  if (input instanceof Date) {
    const ms = input.getTime()
    const secs = Math.floor(ms / 1000)

    mtime = {
      secs: secs,
      nsecs: (ms - (secs * 1000)) * 1000
    }
  }

  /*
  TODO: https://github.com/ipfs/aegir/issues/487

  // process.hrtime.bigint()
  if (input instanceof BigInt) {
    const secs = input / BigInt(1e9)
    const nsecs = input - (secs * BigInt(1e9))

    mtime = {
      secs: parseInt(secs.toString()),
      nsecs: parseInt(nsecs.toString())
    }
  }
  */

  if (!Object.prototype.hasOwnProperty.call(mtime, 'secs')) {
    return undefined
  }

  if (mtime != null && mtime.nsecs != null && (mtime.nsecs < 0 || mtime.nsecs > 999999999)) {
    throw errCode(new Error('mtime-nsecs must be within the range [0,999999999]'), 'ERR_INVALID_MTIME_NSECS')
  }

  return mtime
}

module.exports = parseMtime
