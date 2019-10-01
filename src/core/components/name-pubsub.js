'use strict'

const debug = require('debug')
const errcode = require('err-code')
const callbackify = require('callbackify')

const IpnsPubsubDatastore = require('../ipns/routing/pubsub-datastore')

const log = debug('ipfs:name-pubsub')
log.error = debug('ipfs:name-pubsub:error')

// Is pubsub enabled
const isNamePubsubEnabled = (node) => {
  try {
    return Boolean(getPubsubRouting(node))
  } catch (err) {
    return false
  }
}

// Get pubsub from IPNS routing
const getPubsubRouting = (node) => {
  if (!node._ipns || !node._options.EXPERIMENTAL.ipnsPubsub) {
    throw errcode(new Error('IPNS pubsub subsystem is not enabled'), 'ERR_IPNS_PUBSUB_NOT_ENABLED')
  }

  // Only one store and it is pubsub
  if (IpnsPubsubDatastore.isIpnsPubsubDatastore(node._ipns.routing)) {
    return node._ipns.routing
  }

  // Find in tiered
  const pubsub = (node._ipns.routing.stores || []).find(s => IpnsPubsubDatastore.isIpnsPubsubDatastore(s))

  if (!pubsub) {
    throw errcode(new Error('IPNS pubsub datastore not found'), 'ERR_PUBSUB_DATASTORE_NOT_FOUND')
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
    state: callbackify(async () => { // eslint-disable-line require-await
      return {
        enabled: isNamePubsubEnabled(self)
      }
    }),
    /**
     * Cancel a name subscription.
     *
     * @param {String} name subscription name.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    cancel: callbackify(async (name) => { // eslint-disable-line require-await
      const pubsub = getPubsubRouting(self)

      return pubsub.cancel(name)
    }),
    /**
     * Show current name subscriptions.
     *
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    subs: callbackify(async () => { // eslint-disable-line require-await
      const pubsub = getPubsubRouting(self)

      return pubsub.getSubscriptions()
    })
  }
}
