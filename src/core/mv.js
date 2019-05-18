'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
const toSources = require('./utils/to-sources')
const cp = require('./cp')
const rm = require('./rm')

const defaultOptions = {
  parents: false,
  recursive: false,
  flush: true,
  format: 'dag-pb',
  hashAlg: 'sha2-256',
  shardSplitThreshold: 1000
}

module.exports = (context) => {
  return async function mfsMv (...args) {
    if (Array.isArray(args[0])) {
      args = args[0].concat(args.slice(1))
    }

    const {
      sources
    } = await toSources(context, args)
    const options = applyDefaultOptions(args, defaultOptions)

    const cpArgs = sources
      .map(source => source.path).concat(options)

    // remove the last source as it'll be the destination
    const rmArgs = sources
      .slice(0, -1)
      .map(source => source.path)
      .concat(Object.assign(options, {
        recursive: true
      }))

    await cp(context).apply(null, cpArgs)
    await rm(context).apply(null, rmArgs)
  }
}
