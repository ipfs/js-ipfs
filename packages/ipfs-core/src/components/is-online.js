'use strict'

/**
 * @param {Object} config
 * @param {import('libp2p')} [config.libp2p]
 */
module.exports = ({ libp2p }) => () =>
  Boolean(libp2p && libp2p.isStarted())
