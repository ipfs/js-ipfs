'use strict'

const defaultConfig = require('../../runtime/config-nodejs.js')
const { isValidMultiaddr } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('../init').IPFSRepo} Repo
 */

/**
 * @typedef {Object} Context
 * @property {Repo} repo
 *
 * @typedef {Object} AddOptions
 * @property {boolean} [default]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @param {Context} context
 * @returns {Add}
 */
module.exports = ({ repo }) => {
  /**
   * @callback Add
   * @param {string} multiaddr
   * @param {AddOptions} [options]
   * @returns {Promise<{Peers:string[]}>}
   *
   * @type {Add}
   */
  async function add (multiaddr, options) {
    options = options || {}

    if (multiaddr && !isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    const config = await repo.config.get()
    if (options.default) {
      config.Bootstrap = defaultConfig().Bootstrap
    } else if (multiaddr && config.Bootstrap.indexOf(multiaddr) === -1) {
      config.Bootstrap.push(multiaddr)
    }
    await repo.config.set(config)

    return {
      Peers: options.default ? defaultConfig().Bootstrap : [multiaddr]
    }
  }

  return withTimeoutOption(add)
}
