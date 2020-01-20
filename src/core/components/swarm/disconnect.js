'use strict'

module.exports = ({ libp2p }) => {
  return function disconnect (addr) {
    return libp2p.hangUp(addr)
  }
}
