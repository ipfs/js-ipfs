'use strict'

const applyDefaultOptions = require('./utils/apply-default-options')
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
  shardSplitThreshold: 1000
}

/**
 * @typedef {import('../init').IPLD} IPLD
 * @typedef {import('../init').IPFSRepo} Repo
 * @typedef {import('../index').Block} Block
 * @typedef {import('cids')} CID
 */
/**
 * @typedef {Object} Context
 * @property {IPLD} ipld
 * @property {Block} block
 * @property {Repo} repo
 * @typedef {Object} MvOptions
 * @property {boolean} [parents=false] - If true, create intermediate directories
 * @property {boolean} [p] - Same as `parents` option.
 * @property {boolean} [flush=true] - If true the changes will be immediately flushed to disk
 * @property {string} [hashAlg='sha2-256'] - The hash algorithm to use for any updated entries
 * @property {0|1} [cidVersion=0] - The CID version to use for any updated entries
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @param {Context} context
 * @returns {Mv}
 */
module.exports = (context) => {
  /**
   * @callback Mv
   * @param {string|CID|string[]|CID[]} from
   * @param {string|CID} to
   * @param {MvOptions} options
   * @return {Promise<void>}
   *
   * @type {Mv}
   */
  async function mfsMv (...args) {
    if (Array.isArray(args[0])) {
      // @ts-ignore
      args = args[0].concat(args.slice(1))
    }

    // @ts-ignore - toSources expects strings
    const { sources } = await toSources(context, args)
    const options = applyDefaultOptions(args, defaultOptions)

    const cpArgs = sources
      // @ts-ignore - TS does not seem to infer source type
      .map(source => source.path).concat(options)

    // remove the last source as it'll be the destination
    const rmArgs = sources
      .slice(0, -1)
      // @ts-ignore - TS does not seem to infer source type
      .map(source => source.path)
      .concat(Object.assign(options, {
        recursive: true
      }))

    await cp(context).apply(null, cpArgs)
    await rm(context).apply(null, rmArgs)
  }

  return withTimeoutOption(mfsMv)
}
