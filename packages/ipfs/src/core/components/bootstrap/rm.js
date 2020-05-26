'use strict'

const { isValidMultiaddr } = require('./utils')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('../init').IPFSRepo} Repo
 */

/**
 * @typedef {Object} Context
 * @property {Repo} repo
 *
 * @typedef {Object} RmOptions
 * @property {boolean} [all]
 * @property {number} [timeout]
 * @property {AbortSignal} [signal]
 *
 * @param {Context} context
 * @returns {Rm}
 */
module.exports = ({ repo }) => {
  /**
   * @callback Rm
   * @param {string} [multiaddr]
   * @param {RmOptions} [options]
   * @returns {{Peers: string[]}}
   *
   * @type {Rm}
   */
  async function rm (multiaddr, options) {
    options = options || {}

    if (multiaddr && !isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    let res = []
    const config = await repo.config.get()

    if (options.all) {
      res = config.Bootstrap || []
      config.Bootstrap = []
    } else {
      config.Bootstrap = (config.Bootstrap || []).filter(ma => ma !== multiaddr)
    }

    await repo.config.set(config)

    if (!options.all && multiaddr) {
      res.push(multiaddr)
    }

    return { Peers: res }
  }

  return withTimeoutOption(rm)
}
