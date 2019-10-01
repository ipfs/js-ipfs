'use strict'

const defaultConfig = require('../runtime/config-nodejs.js')
const isMultiaddr = require('mafmt').IPFS.matches
const callbackify = require('callbackify')

function isValidMultiaddr (ma) {
  try {
    return isMultiaddr(ma)
  } catch (err) {
    return false
  }
}

function invalidMultiaddrError (ma) {
  return new Error(`${ma} is not a valid Multiaddr`)
}

module.exports = function bootstrap (self) {
  return {
    list: callbackify(async () => {
      const config = await self._repo.config.get()

      return { Peers: config.Bootstrap }
    }),
    add: callbackify.variadic(async (multiaddr, args = { default: false }) => {
      if (multiaddr && !isValidMultiaddr(multiaddr)) {
        throw invalidMultiaddrError(multiaddr)
      }

      const config = await self._repo.config.get()
      if (args.default) {
        config.Bootstrap = defaultConfig().Bootstrap
      } else if (multiaddr && config.Bootstrap.indexOf(multiaddr) === -1) {
        config.Bootstrap.push(multiaddr)
      }
      await self._repo.config.set(config)

      return {
        Peers: args.default ? defaultConfig().Bootstrap : [multiaddr]
      }
    }),
    rm: callbackify.variadic(async (multiaddr, args = { all: false }) => {
      if (multiaddr && !isValidMultiaddr(multiaddr)) {
        throw invalidMultiaddrError(multiaddr)
      }

      const config = await self._repo.config.get()
      if (args.all) {
        config.Bootstrap = []
      } else {
        config.Bootstrap = config.Bootstrap.filter((mh) => mh !== multiaddr)
      }

      await self._repo.config.set(config)

      const res = []
      if (!args.all && multiaddr) {
        res.push(multiaddr)
      }

      return { Peers: res }
    })
  }
}
