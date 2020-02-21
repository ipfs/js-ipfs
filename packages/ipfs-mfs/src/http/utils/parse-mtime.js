'use strict'

module.exports = (secs, nsecs) => {
  if ((secs === undefined || secs === null) && (nsecs === undefined || nsecs === null)) {
    return
  }

  const mtime = {}

  if (nsecs || nsecs === 0) {
    mtime.secs = 0
    mtime.nsecs = nsecs
  }

  if (secs || secs === 0) {
    mtime.secs = secs
  }

  return mtime
}
