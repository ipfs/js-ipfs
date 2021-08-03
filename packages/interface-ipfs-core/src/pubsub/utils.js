'use strict'

const { nanoid } = require('nanoid')
const delay = require('delay')

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {string} topic
 * @param {string[]} peersToWait
 * @param {number} waitForMs
 * @returns
 */
async function waitForPeers (ipfs, topic, peersToWait, waitForMs) {
  const start = Date.now()

  while (true) {
    const peers = await ipfs.pubsub.peers(topic)
    const everyPeerFound = peersToWait.every(p => peers.includes(p))

    if (everyPeerFound) {
      return
    }

    if (Date.now() > start + waitForMs) {
      throw new Error(`Timed out waiting for peers to be subscribed to "${topic}"`)
    }

    await delay(10)
  }
}

exports.waitForPeers = waitForPeers

exports.getTopic = () => 'pubsub-tests-' + nanoid()
