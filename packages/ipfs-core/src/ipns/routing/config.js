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
 * @param {import('libp2p').Libp2p} arg.libp2p
 * @param {import('ipfs-repo').IPFSRepo} arg.repo
 * @param {import('@libp2p/interfaces/peer-id').PeerId} arg.peerId
 * @param {object} arg.options
 */
export function createRouting ({ libp2p, repo, peerId, options }) {
  // Setup online routing for IPNS with a tiered routing composed by a DHT and a Pubsub router (if properly enabled)
  /** @type {any[]} */
  const ipnsStores = []

  // Add IPNS pubsub if enabled
  let pubsubDs
  if (get(options, 'EXPERIMENTAL.ipnsPubsub', false)) {
    pubsubDs = new IpnsPubsubDatastore(libp2p.pubsub, repo.datastore, peerId)
    ipnsStores.push(pubsubDs)
  }

  // Add DHT datastore if enabled
  if (get(options, 'offline', false) !== true && ['dht', 'dhtclient', 'dhtserver'].includes(get(options, 'config.Routing.Type', 'none'))) {
    ipnsStores.push(new DHTDatastore(libp2p.dht))
  }

  // Add an offline datastore if we are offline or no other datastores are configured
  if (get(options, 'offline', false) || ipnsStores.length === 0) {
    const offlineDatastore = new OfflineDatastore(repo.datastore)
    ipnsStores.push(offlineDatastore)
  }

  // Create ipns routing with a set of datastores
  return new TieredDatastore(ipnsStores)
}
