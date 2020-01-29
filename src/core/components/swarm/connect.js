'use strict'

module.exports = ({ libp2p }) => {
  return function connect (addr) {
    return libp2p.dial(addr)
  }
}
