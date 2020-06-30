'use strict'

const toMfsPath = require('./to-mfs-path')
const applyDefaultOptions = require('./apply-default-options')

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

  options = applyDefaultOptions(options, defaultOptions)

  return {
    sources: await toMfsPath(context, sources, options),
    options
  }
}

module.exports = toSources
