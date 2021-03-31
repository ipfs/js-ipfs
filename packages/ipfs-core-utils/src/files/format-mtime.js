'use strict'

/* TODO vmx 2021-03-30 enable again
 * @param {import('ipfs-unixfs').Mtime} mtime
 * @returns {string}
 */
// @ts-ignore - TODO vmx 2021-03-30 enable again
function formatMtime (mtime) {
  if (mtime == null) {
    return '-'
  }

  const date = new Date((mtime.secs * 1000) + Math.round((mtime.nsecs || 0) / 1000))

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
