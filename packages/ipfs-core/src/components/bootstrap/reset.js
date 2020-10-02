'use strict'

const defaultConfig = require('../../runtime/config-nodejs.js')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ repo }) => {
  return withTimeoutOption(async function reset (options = {}) {
    const config = await repo.config.getAll(options)
    config.Bootstrap = defaultConfig().Bootstrap

    await repo.config.set(config)

    return {
      Peers: defaultConfig().Bootstrap
    }
  })
}
