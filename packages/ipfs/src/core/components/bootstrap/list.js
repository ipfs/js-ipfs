'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('../init').IPFSRepo} Repo
 */

/**
 * @typedef {Object} Context
 * @property {Repo} repo
 *
 * @typedef {Object} ListOptions
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @param {Context} context
 * @returns {List}
 */
module.exports = ({ repo }) => {
  /**
   * @callback List
   * @param {ListOptions} [options]
   * @returns {{Peers: string[]}}
   *
   * @type {List}
   */
  async function list (options) {
    const peers = await repo.config.get('Bootstrap', options)
    return { Peers: peers || [] }
  }

  return withTimeoutOption(list)
}
