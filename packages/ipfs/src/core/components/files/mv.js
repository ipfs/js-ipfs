'use strict'

const toSources = require('./utils/to-sources')
const cp = require('./cp')
const rm = require('./rm')
const { withTimeoutOption } = require('../../utils')

const defaultOptions = {
  parents: false,
  recursive: false,
  flush: true,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  shardSplitThreshold: 1000,
  signal: undefined
}

module.exports = (context) => {
  return withTimeoutOption(async function mfsMv (...args) {
    const {
      sources,
      options
    } = await toSources(context, args, defaultOptions)

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
  })
}
