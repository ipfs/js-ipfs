'use strict'

const toMfsPath = require('./to-mfs-path')

/**
 * @typedef {import("../write").WriteContext} MFSContext
 * @typedef {import("./to-mfs-path").PathInfo} PathInfo
 */
/**
 * @param {MFSContext} context
 * @param {string|string[]} args
 * @return {Promise<{sources:PathInfo[]}>}
 */
async function toSources (context, args) {
  // Support weird mfs.mv([source, dest], options, callback) signature
  if (Array.isArray(args[0])) {
    args = args[0]
  }

  const sources = (/** @type {string[]} */ (args))
    .filter(arg => typeof arg === 'string')
    .map(source => source.trim())

  return {
    sources: await toMfsPath(context, sources)
  }
}

module.exports = toSources
