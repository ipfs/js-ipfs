'use strict'

const { isValidMultiaddr } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API["add"]}
   */
  async function add (multiaddr, options = {}) {
    if (!isValidMultiaddr(multiaddr)) {
      throw new Error(`${multiaddr} is not a valid Multiaddr`)
    }

    /** @type {import('ipfs-core-types/src/config').Config} */
    // @ts-ignore repo returns type unknown
    const config = await repo.config.getAll(options)

    const boostrappers = config.Bootstrap || []
    boostrappers.push(multiaddr.toString())

    config.Bootstrap = Array.from(
      new Set(boostrappers)
    ).sort((a, b) => a.localeCompare(b))

    await repo.config.replace(config)

    return {
      Peers: [multiaddr]
    }
  }

  return withTimeoutOption(add)
}
