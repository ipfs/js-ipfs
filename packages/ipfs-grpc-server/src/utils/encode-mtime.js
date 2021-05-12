'use strict'

/**
 * @param {import('ipfs-unixfs').Mtime} [mtime]
 */
function encodeMtime (mtime) {
  const output = {}

  if (!mtime) {
    return output
  }

  const {
    secs,
    nsecs
  } = mtime

  if (secs != null) {
    output.mtime = secs

    if (nsecs != null) {
      output.mtime_nsecs = nsecs
    }
  }

  return output
}

module.exports = encodeMtime
