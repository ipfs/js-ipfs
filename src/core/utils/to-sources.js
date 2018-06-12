'use strict'

const path = require('path')

function toSources (args, defaultOptions) {
  args = args.slice()
  const callback = args.filter(arg => typeof arg === 'function').pop()
  const options = Object.assign({}, defaultOptions, args.filter(arg => typeof arg === 'object').pop() || {})

  // Support weird mfs.mv([source, dest], options, callback) signature
  if (Array.isArray(args[0])) {
    args = args[0]
  }

  const sources = args
    .filter(arg => typeof arg === 'string')
    .map(source => {
      source = source.trim()

      return {
        path: source,
        name: path.basename(source),
        dir: path.dirname(source)
      }
    })

  return {
    sources,
    options,
    callback
  }
}

module.exports = toSources
