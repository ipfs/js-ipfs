'use strict'

const toMfsPath = require('./to-mfs-path')
const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })

async function toSources (context, args, defaultOptions) {
  const sources = []
  let options

  // takes string arguments and a final optional non-string argument
  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] === 'string' || args[i] instanceof String) {
      sources.push(args[i].trim())
    } else if (i === args.length - 1) {
      options = args[i]
    }
  }

  options = mergeOptions(defaultOptions, options)

  return {
    sources: await toMfsPath(context, sources, options),
    options
  }
}

module.exports = toSources
