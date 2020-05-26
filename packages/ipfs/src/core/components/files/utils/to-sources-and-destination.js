'use strict'

const toSources = require('./to-sources')

/**
 * @typedef {import('./to-sources').MFSContext} Context
 * @typedef {import('./to-sources').PathInfo} PathInfo
 */

/**
 * @param {Context} context
 * @param {string[]} args
 * @returns {Promise<{destination:PathInfo, sources:PathInfo[], options:void}>}
 */
async function toSourcesAndDestination (context, args) {
  const {
    sources,
    // @ts-ignore - toSources does not return options
    options
  } = await toSources(context, args)

  /** @type {PathInfo} - Need to cast because on empty pop returns void */
  const destination = (sources.pop())

  return {
    destination,
    sources,
    options
  }
}

module.exports = toSourcesAndDestination
