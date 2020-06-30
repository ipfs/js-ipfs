'use strict'

const { withTimeoutOption } = require('../../utils')

module.exports = ({ repo }) => {
  return withTimeoutOption(async function list (options) {
    const peers = await repo.config.get('Bootstrap', options)
    return { Peers: peers || [] }
  })
}
