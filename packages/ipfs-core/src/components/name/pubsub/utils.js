'use strict'

const IpnsPubsubDatastore = require('../../../ipns/routing/pubsub-datastore')
const errcode = require('err-code')

/**
 * @typedef {import('../../../types').ExperimentalOptions} ExperimentalOptions
 * @property {boolean} [ipnsPubsub] - Enable pub-sub on IPNS. (Default: `false`)
 */

/**
 * Get pubsub from IPNS routing
 *
 * @param {import('../../ipns')} ipns
 * @param {ExperimentalOptions} [options]
 */
exports.getPubsubRouting = (ipns, options) => {
  if (!ipns || !(options && options.ipnsPubsub)) {
    throw errcode(new Error('IPNS pubsub subsystem is not enabled'), 'ERR_IPNS_PUBSUB_NOT_ENABLED')
  }

  // Only one store and it is pubsub
  if (ipns.routing instanceof IpnsPubsubDatastore) {
    return ipns.routing
  }

  // Find in tiered
  const pubsub = (ipns.routing.stores || []).find(s => s instanceof IpnsPubsubDatastore)

  if (!pubsub) {
    throw errcode(new Error('IPNS pubsub datastore not found'), 'ERR_PUBSUB_DATASTORE_NOT_FOUND')
  }

  return pubsub
}
