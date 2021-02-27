'use strict'

const last = require('it-last')
const addAll = require('./add-all')
/**
 * @param {import('.').Context} context
 * @param {import('cids')|string} path
 * @param {import('ipfs-core-types/src/pin').AddOptions} [options]
 */
const add = async (context, path, options = {}) =>
  /** @type {import('cids')} - Need to loosen check here because it could be void */
  (await last(addAll(context, { path, ...options }, options)))

module.exports = add
