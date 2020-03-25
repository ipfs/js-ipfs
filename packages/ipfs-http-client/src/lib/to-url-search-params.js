'use strict'

const modeToString = require('./mode-to-string')
const mtimeToObject = require('./mtime-to-object')

module.exports = (args, options) => {
  const searchParams = new URLSearchParams(options)

  if (args === undefined || args === null) {
    args = []
  } else if (!Array.isArray(args)) {
    args = [args]
  }

  args.forEach(arg => searchParams.append('arg', arg))

  if (options.hashAlg) {
    searchParams.set('hash', options.hashAlg)
    searchParams.delete('hashAlg')
  }

  if (options.mtime != null) {
    const mtime = mtimeToObject(options.mtime)

    searchParams.set('mtime', mtime.secs)
    searchParams.set('mtime-nsecs', mtime.nsecs)
  }

  if (options.mode != null) {
    searchParams.set('mode', modeToString(options.mode))
  }

  return searchParams
}
