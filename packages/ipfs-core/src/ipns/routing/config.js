'use strict'

const { TieredDatastore } = require('datastore-core')
const get = require('dlv')

const PubsubDatastore = require('./pubsub-datastore')
const OfflineDatastore = require('./offline-datastore')

/**
 * @param {object} arg
 * @param {import('libp2p')} arg.libp2p
 * @param {import('ipfs-repo')} arg.repo
 * @param {import('peer-id')} arg.peerId
 * @param {object} arg.options
 */
module.exports = ({ libp2p, repo, peerId, options }) => {
  // Setup online routing for IPNS with a tiered routing composed by a DHT and a Pubsub router (if properly enabled)
  const ipnsStores = []

  // Add IPNS pubsub if enabled
  let pubsubDs
  if (get(options, 'EXPERIMENTAL.ipnsPubsub', false)) {
    const pubsub = libp2p.pubsub
    const localDatastore = repo.datastore

    pubsubDs = new PubsubDatastore(pubsub, localDatastore, peerId)
    ipnsStores.push(pubsubDs)
  }

  // DHT should not be added as routing if we are offline or it is disabled
  if (get(options, 'offline') || !get(options, 'libp2p.config.dht.enabled', false)) {
    const offlineDatastore = new OfflineDatastore(repo)
    ipnsStores.push(offlineDatastore)
  } else {
    ipnsStores.push(libp2p._dht)
  }

  // Create ipns routing with a set of datastores
  return new TieredDatastore(ipnsStores)
}
