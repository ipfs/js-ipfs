'use strict'

const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')
const flatMap = require('lodash.flatmap')
const values = require('lodash.values')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function swarm (self) {
  return {
    /**
     * @alias swarm.peers
     * @memberof IPFS#
     * @method
     * @param {Object} [opts={}]
     * @param {function(Error)} callback
     * @returns {Promise<*>|undefined}
     */
    peers: promisify((opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }

      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      const verbose = opts.v || opts.verbose
      // TODO: return latency and streams when verbose is set
      // we currently don't have this information

      const peers = self._libp2pNode.peerBook.getAll()
      const keys = Object.keys(peers)

      const peerList = flatMap(keys, (id) => {
        const peer = peers[id]

        return peer.multiaddrs.map((addr) => {
          const res = {
            addr: addr,
            peer: peers[id]
          }

          if (verbose) {
            res.latency = 'unknown'
          }

          return res
        })
      })

      callback(null, peerList)
    }),

    /**
     * Get all the addresses we know.
     *
     * @alias swarm.addrs
     * @memberof IPFS#
     * @method
     * @param {function(Error)} callback
     * @returns {Promise<*>|undefined}
     */
    addrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      const peers = values(self._libp2pNode.peerBook.getAll())
      callback(null, peers)
    }),

    /**
     *
     * @alias swarm.localAddrs
     * @memberof IPFS#
     * @method
     * @param {function(Error)} callback
     * @returns {Promise<*>|undefined}
     */
    localAddrs: promisify((callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      callback(null, self._libp2pNode.peerInfo.multiaddrs)
    }),

    /**
     * @alias swarm.connect
     * @memberof IPFS#
     * @method
     * @param {Multiaddr|string} maddr
     * @param {function(Error)} callback
     * @returns {Promise<*>|undefined}
     */
    connect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      if (typeof maddr === 'string') {
        maddr = multiaddr(maddr)
      }

      self._libp2pNode.dialByMultiaddr(maddr, callback)
    }),

    /**
     * @alias swarm.disconnect
     * @memberof IPFS#
     * @method
     * @param {Multiaddr|string}
     * @param {function(Error)} callback
     * @returns {Promise<*>|undefined}
     */
    disconnect: promisify((maddr, callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      if (typeof maddr === 'string') {
        maddr = multiaddr(maddr)
      }

      self._libp2pNode.hangUpByMultiaddr(maddr, callback)
    }),

    /**
     * NOT IMPLEMENTED
     *
     * @alias swarm.filters
     * @memberof IPFS#
     * @method
     * @param {function(Error)} callback
     * @returns {Promise<*>|undefined}
     */
    filters: promisify((callback) => {
      // TODO
      throw new Error('Not implemented')
    })
  }
}
