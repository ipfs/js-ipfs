'use strict'

const IpnsPubsubDatastore = require('../../../ipns/routing/pubsub-datastore')
const errcode = require('err-code')

/**
 * Get pubsub from IPNS routing
 *
 * @param {import('.').IPNS} ipns
 * @param {PubSubRoutingOptions} [options]
 */
exports.getPubsubRouting = (ipns, options) => {
  if (!ipns || !(options && options.ipnsPubsub)) {
    throw errcode(new Error('IPNS pubsub subsystem is not enabled'), 'ERR_IPNS_PUBSUB_NOT_ENABLED')
  }

  // Only one store and it is pubsub
  if (IpnsPubsubDatastore.isIpnsPubsubDatastore(ipns.routing)) {
    return ipns.routing
  }

  // Find in tiered
  const pubsub = (ipns.routing.stores || []).find(s => IpnsPubsubDatastore.isIpnsPubsubDatastore(s))

  if (!pubsub) {
    throw errcode(new Error('IPNS pubsub datastore not found'), 'ERR_PUBSUB_DATASTORE_NOT_FOUND')
  }

  return pubsub
}

/**
 * @typedef {Object} PubSubRoutingOptions
 * @property {boolean} [ipnsPubsub] - Enable pub-sub on IPNS. (Default: `false`)
 */
