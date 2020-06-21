'use strict'

const toSources = require('./to-sources')

async function toSourcesAndDestination (context, args, defaultOptions) {
  const {
    sources,
    options
  } = await toSources(context, args, defaultOptions)

  const destination = sources.pop()

  return {
    destination,
    sources,
    options
  }
}

module.exports = toSourcesAndDestination
