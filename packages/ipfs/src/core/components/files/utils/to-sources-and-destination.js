'use strict'

const toSources = require('./to-sources')

async function toSourcesAndDestination (context, args) {
  const {
    sources,
    options
  } = await toSources(context, args)

  const destination = sources.pop()

  return {
    destination,
    sources,
    options
  }
}

module.exports = toSourcesAndDestination
