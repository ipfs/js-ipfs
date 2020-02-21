'use strict'

module.exports = function parseMtime (mtime) {
  if (mtime == null) {
    return undefined
  }

  // Javascript Date
  if (mtime instanceof Date) {
    const ms = mtime.getTime()
    const secs = Math.floor(ms / 1000)

    return {
      secs: secs,
      nsecs: (ms - (secs * 1000)) * 1000
    }
  }

  // { secs, nsecs }
  if (Object.prototype.hasOwnProperty.call(mtime, 'secs')) {
    return {
      secs: mtime.secs,
      nsecs: mtime.nsecs
    }
  }

  // UnixFS TimeSpec
  if (Object.prototype.hasOwnProperty.call(mtime, 'Seconds')) {
    return {
      secs: mtime.Seconds,
      nsecs: mtime.FractionalNanoseconds
    }
  }

  // process.hrtime()
  if (Array.isArray(mtime)) {
    return {
      secs: mtime[0],
      nsecs: mtime[1]
    }
  }
  /*
  TODO: https://github.com/ipfs/aegir/issues/487

  // process.hrtime.bigint()
  if (typeof mtime === 'bigint') {
    const secs = mtime / BigInt(1e9)
    const nsecs = mtime - (secs * BigInt(1e9))

    return {
      secs: parseInt(secs),
      nsecs: parseInt(nsecs)
    }
  }
  */
}
