'use strict'

const { TieredDatastore } = require('datastore-core')
const PubsubDatastore = require('./pubsub-datastore')
const OfflineDatastore = require('./offline-datastore')
const DnsDatastore = require('./dns-datastore')
const MDnsDatastore = require('./mdns-datastore')
const WorkersDatastore = require('./workers-datastore')
/**
 * @typedef { import("../../index") } IPFS
 */

/**
 * IPNS routing config
 *
 * @param {IPFS} ipfs
 * @returns {function}
 */
module.exports = (ipfs) => {
  // Setup online routing for IPNS with a tiered routing composed by a DHT and a Pubsub router (if properly enabled)
  const ipnsStores = []

  // // Add IPNS pubsub if enabled
  if (ipfs._options.EXPERIMENTAL.ipnsPubsub) {
    ipnsStores.push(new PubsubDatastore(ipfs.libp2p.pubsub, ipfs._repo.datastore, ipfs._peerInfo.id))
  }

  // Add DHT if we are online
  if (ipfs.isOnline()) {
    ipnsStores.push(ipfs.libp2p.dht)
  } else {
    ipnsStores.push(new OfflineDatastore(ipfs._repo))
  }

  ipnsStores.push(new MDnsDatastore())
  ipnsStores.push(new DnsDatastore())
  ipnsStores.push(new WorkersDatastore())

  // Create ipns routing with a set of datastores
  return new TieredDatastore(ipnsStores)
}
