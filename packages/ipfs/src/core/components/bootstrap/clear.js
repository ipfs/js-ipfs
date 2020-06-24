'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ repo }) => {
  return withTimeoutOption(async function clear (options = {}) {
    const config = await repo.config.getAll(options)
    const removed = config.Bootstrap || []
    config.Bootstrap = []

    await repo.config.set(config)

    return { Peers: removed }
  })
}
