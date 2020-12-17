'use strict'

/**
 * @param {import('ipfs-core-types/src/files').MTime} mtime
 * @returns {string}
 */
function formatMtime (mtime) {
  if (mtime == null) {
    return '-'
  }

  const date = new Date((mtime.secs * 1000) + Math.round(mtime.nsecs / 1000))

  return date.toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  })
}

module.exports = formatMtime
