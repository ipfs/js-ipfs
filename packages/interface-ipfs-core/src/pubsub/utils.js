import { nanoid } from 'nanoid'
import delay from 'delay'

/**
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 */

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {string} topic
 * @param {PeerId[]} peersToWait
 * @param {number} waitForMs
 * @returns
 */
export async function waitForPeers (ipfs, topic, peersToWait, waitForMs) {
  const start = Date.now()

  while (true) {
    const peers = await ipfs.pubsub.peers(topic)
    const everyPeerFound = peersToWait.every(p => peers.map(p => p.toString()).includes(p.toString()))

    if (everyPeerFound) {
      return
    }

    if (Date.now() > start + waitForMs) {
      throw new Error(`Timed out waiting for peers to be subscribed to "${topic}"`)
    }

    await delay(10)
  }
}

export function getTopic () {
  return 'pubsub-tests-' + nanoid()
}
