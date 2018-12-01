'use strict'

const debug = require('debug')
const errcode = require('err-code')
const promisify = require('promisify-es6')

const IpnsPubsubDatastore = require('../ipns/routing/pubsub-datastore')

const log = debug('jsipfs:name-pubsub')
log.error = debug('jsipfs:name-pubsub:error')

// Is pubsub enabled
const isNamePubsubEnabled = (node) => {
  let pubsub
  try {
    pubsub = getPubsubRouting(node)
  } catch (err) {
    return false
  }

  return Boolean(pubsub)
}

// Get pubsub from IPNS routing
const getPubsubRouting = (node) => {
  if (!node._ipns || !node._options.EXPERIMENTAL.ipnsPubsub) {
    const errMsg = 'IPNS pubsub subsystem is not enabled'

    log.error(errMsg)
    throw errcode(errMsg, 'ERR_IPNS_PUBSUB_NOT_ENABLED')
  }

  // Only one store and it is pubsub
  if (IpnsPubsubDatastore.isIpnsPubsubDatastore(node._ipns.routing)) {
    return node._ipns.routing
  }

  // Find in tiered
  const pubsub = (node._ipns.routing.stores || []).find(s => IpnsPubsubDatastore.isIpnsPubsubDatastore(s))

  if (!pubsub) {
    const errMsg = 'IPNS pubsub datastore not found'

    log.error(errMsg)
    throw errcode(errMsg, 'ERR_PUBSUB_DATASTORE_NOT_FOUND')
  }
  return pubsub
}

module.exports = function namePubsub (self) {
  return {
    /**
     * Query the state of IPNS pubsub.
     *
     * @returns {Promise|void}
     */
    state: promisify((callback) => {
      callback(null, {
        enabled: isNamePubsubEnabled(self)
      })
    }),
    /**
     * Cancel a name subscription.
     *
     * @param {String} name subscription name.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    cancel: promisify((name, callback) => {
      let pubsub
      try {
        pubsub = getPubsubRouting(self)
      } catch (err) {
        return callback(err)
      }

      pubsub.cancel(name, callback)
    }),
    /**
     * Show current name subscriptions.
     *
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    subs: promisify((callback) => {
      let pubsub
      try {
        pubsub = getPubsubRouting(self)
      } catch (err) {
        return callback(err)
      }

      pubsub.getSubscriptions(callback)
    })
  }
}
