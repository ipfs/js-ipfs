'use strict'

const WS = require('libp2p-websockets')
const filters = require('libp2p-websockets/src/filters')
const transportKey = WS.prototype[Symbol.toStringTag]

module.exports = () => ({
  libp2p: {
    config: {
      transport: {
        [transportKey]: {
          filter: filters.all
        }
      }
    }
  }
})
