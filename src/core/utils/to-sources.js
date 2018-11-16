'use strict'

const toMfsPath = require('./to-mfs-path')

function toSources (context, args, defaultOptions, callback) {
  args = args.slice()
  const options = Object.assign({}, defaultOptions, args.filter(arg => typeof arg === 'object').pop() || {})

  // Support weird mfs.mv([source, dest], options, callback) signature
  if (Array.isArray(args[0])) {
    args = args[0]
  }

  const sources = args
    .filter(arg => typeof arg === 'string')
    .map(source => source.trim())

  toMfsPath(context, sources, (err, sources) => {
    callback(err, {
      sources,
      options
    })
  })
}

module.exports = toSources
