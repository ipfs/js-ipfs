'use strict'

const path = require('path')

function toSources (args, defaultOptions) {
  args = args.slice()
  const callback = args.filter(arg => typeof arg === 'function').pop()
  const options = Object.assign({}, defaultOptions, args.filter(arg => typeof arg === 'object').pop() || {})

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
