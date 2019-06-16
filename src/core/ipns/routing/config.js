'use strict'

const { TieredDatastore } = require('datastore-core')
const get = require('dlv')

const PubsubDatastore = require('./pubsub-datastore')
const OfflineDatastore = require('./offline-datastore')

module.exports = (ipfs) => {
  // Setup online routing for IPNS with a tiered routing composed by a DHT and a Pubsub router (if properly enabled)
  const ipnsStores = []

  // Add IPNS pubsub if enabled
  let pubsubDs
  if (get(ipfs._options, 'EXPERIMENTAL.ipnsPubsub', false)) {
    const pubsub = ipfs.libp2p.pubsub
    const localDatastore = ipfs._repo.datastore
    const peerId = ipfs._peerInfo.id

    pubsubDs = new PubsubDatastore(pubsub, localDatastore, peerId)
    ipnsStores.push(pubsubDs)
  }

  // DHT should not be added as routing if we are offline or it is disabled
  if (get(ipfs._options, 'offline') || !get(ipfs._options, 'libp2p.config.dht.enabled', false)) {
    const offlineDatastore = new OfflineDatastore(ipfs._repo)
    ipnsStores.push(offlineDatastore)
  } else {
    ipnsStores.push(ipfs.libp2p.dht)
  }

  // Create ipns routing with a set of datastores
  return new TieredDatastore(ipnsStores)
}
