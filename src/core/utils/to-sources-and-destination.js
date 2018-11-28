'use strict'

const toSources = require('./to-sources')

function toSourcesAndDestination (context, args, defaultOptions, callback) {
  toSources(context, args, defaultOptions, (err, result) => {
    if (err) {
      return callback(err)
    }

    const destination = result.sources.pop()

    callback(null, {
      destination,
      ...result
    })
  })
}

module.exports = toSourcesAndDestination
