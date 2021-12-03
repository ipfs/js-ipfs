
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import delay from 'delay'

/**
 * @param {Uint8Array} [data]
 * @returns
 */
export async function fakeCid (data) {
  const bytes = data || uint8ArrayFromString(`TEST${Math.random()}`)
  const mh = await sha256.digest(bytes)
  return CID.createV0(mh)
}

/**
 * @param {import('ipfs-core-types').IPFS} nodeA
 * @param {import('ipfs-core-types').IPFS} nodeB
 */
export async function ensureReachable (nodeA, nodeB) {
  /**
   * @param {import('ipfs-core-types').IPFS} source
   * @param {import('ipfs-core-types').IPFS} target
   */
  async function canFindOnDHT (source, target) {
    const { id } = await target.id()

    for await (const event of source.dht.query(id)) {
      if (event.name === 'PEER_RESPONSE' && event.from === id) {
        return
      }
    }

    throw new Error(`Could not find ${id} in DHT`)
  }

  const nodeBId = await nodeB.id()
  await nodeA.swarm.connect(nodeBId.addresses[0])

  while (true) {
    try {
      await Promise.all([
        canFindOnDHT(nodeA, nodeB),
        canFindOnDHT(nodeB, nodeA)
      ])

      break
    } catch {
      await delay(1000)
    }
  }
}
