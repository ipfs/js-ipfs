'use strict'

/**
 * @param {{libp2p?:any}} config
 */
module.exports = ({ libp2p }) => {
  return () => Boolean(libp2p && libp2p.isStarted())
}
