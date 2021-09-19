
/**
 * @param {number | undefined} secs
 * @param {number | undefined} nsecs
 */
export function parseMtime (secs, nsecs) {
  if (secs == null && nsecs == null) {
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
