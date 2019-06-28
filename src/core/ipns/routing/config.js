'use strict'

const get = require('dlv')
const { TieredDatastore } = require('datastore-core')
const PubsubDatastore = require('./pubsub-datastore')
const OfflineDatastore = require('./offline-datastore')
const DnsDatastore = require('./experimental/dns-datastore')
const MDnsDatastore = require('./experimental/mdns-datastore')
// const WorkersDatastore = require('./experimental/workers-datastore')
const ExperimentalTieredDatastore = require('./experimental/tiered-datastore')
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
  if (ipfs._options.EXPERIMENTAL.ipnsDNS) {
    // something is wrong with the workers code disabled for now
    // ipnsStores.push(new WorkersDatastore(ipfs._options.ipns))
    ipnsStores.push(new DnsDatastore(ipfs._options.ipns))
    ipnsStores.push(new MDnsDatastore(ipfs._options.ipns))
    return new ExperimentalTieredDatastore(ipnsStores)
  }

  // // Add IPNS pubsub if enabled
  if (ipfs._options.EXPERIMENTAL.ipnsPubsub) {
    ipnsStores.push(new PubsubDatastore(ipfs.libp2p.pubsub, ipfs._repo.datastore, ipfs._peerInfo.id))
  }

  // Add DHT if we are online
  if (get(ipfs._options, 'offline') || !get(ipfs._options, 'libp2p.config.dht.enabled', false)) {
    ipnsStores.push(ipfs.libp2p.dht)
  } else {
    ipnsStores.push(new OfflineDatastore(ipfs._repo))
  }

  // Create ipns routing with a set of datastores
  return new TieredDatastore(ipnsStores)
}
