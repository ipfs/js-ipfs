import { TieredDatastore } from 'datastore-core/tiered'
import get from 'dlv'
import { IpnsPubsubDatastore } from './pubsub-datastore.js'
import { OfflineDatastore } from './offline-datastore.js'
import { DHTDatastore } from './dht-datastore.js'

/**
 * @typedef {import('interface-datastore').Datastore} Datastore
 */

/**
 * @param {object} arg
 * @param {import('libp2p')} arg.libp2p
 * @param {import('ipfs-repo').IPFSRepo} arg.repo
 * @param {import('peer-id')} arg.peerId
 * @param {object} arg.options
 */
export function createRouting ({ libp2p, repo, peerId, options }) {
  // Setup online routing for IPNS with a tiered routing composed by a DHT and a Pubsub router (if properly enabled)
  /** @type {any[]} */
  const ipnsStores = []

  // Add IPNS pubsub if enabled
  let pubsubDs
  if (get(options, 'EXPERIMENTAL.ipnsPubsub', false)) {
    const pubsub = libp2p.pubsub
    const localDatastore = repo.datastore

    pubsubDs = new IpnsPubsubDatastore(pubsub, localDatastore, peerId)
    ipnsStores.push(pubsubDs)
  }

  // DHT should not be added as routing if we are offline or it is disabled
  if (get(options, 'offline') || get(options, 'config.Routing.Type', 'none') === 'none') {
    const offlineDatastore = new OfflineDatastore(repo)
    ipnsStores.push(offlineDatastore)
  } else {
    ipnsStores.push(new DHTDatastore(libp2p._dht))
  }

  // Create ipns routing with a set of datastores
  return new TieredDatastore(ipnsStores)
}
