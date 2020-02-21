'use strict'

module.exports = ({ repo }) => {
  return async function list () {
    const config = await repo.config.get()
    return { Peers: config.Bootstrap || [] }
  }
}
