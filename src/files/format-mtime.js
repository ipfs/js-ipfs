'use strict'

function formatMtime (mtime) {
  if (mtime === undefined) {
    return '-'
  }

  return new Date(mtime * 1000).toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
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
