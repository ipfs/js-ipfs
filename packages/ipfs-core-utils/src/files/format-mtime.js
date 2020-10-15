'use strict'

/**
 * @param {MTime} mtime
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

/**
 * @typedef {object} MTime
 * @property {number} secs - the number of seconds since (positive) or before
 * (negative) the Unix Epoch began
 * @property {number} nsecs - the number of nanoseconds since the last full
 * second.
 */

module.exports = formatMtime
