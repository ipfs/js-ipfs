'use strict'

const toSources = require('./to-sources')

function toSourcesAndDestination (args, defaultOptions) {
  const {
    sources,
    options,
    callback
  } = toSources(args, defaultOptions)

  const destination = sources.pop()

  return {
    sources,
    destination,
    options,
    callback
  }
}

module.exports = toSourcesAndDestination
