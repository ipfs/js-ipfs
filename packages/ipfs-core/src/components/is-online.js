'use strict'

module.exports = ({ libp2p }) => {
  return () => Boolean(libp2p && libp2p.isStarted())
}
