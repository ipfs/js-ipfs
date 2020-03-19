'use strict'

const toMfsPath = require('./to-mfs-path')

async function toSources (context, args) {
  // Support weird mfs.mv([source, dest], options, callback) signature
  if (Array.isArray(args[0])) {
    args = args[0]
  }

  const sources = args
    .filter(arg => typeof arg === 'string')
    .map(source => source.trim())

  return {
    sources: await toMfsPath(context, sources)
  }
}

module.exports = toSources
