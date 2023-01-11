/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { nanoid } from 'nanoid'
import { getTopic } from './utils.js'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import pWaitFor from 'p-wait-for'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 */

/**
 * @param {string} topic
 * @param {IPFS} ipfs
 * @param {IPFS} remote
 */
async function waitForRemoteToBeSubscribed (topic, ipfs, remote) {
  await remote.pubsub.subscribe(topic, () => {})
  const remoteId = await remote.id()

  // wait for remote to be subscribed to topic
  await pWaitFor(async () => {
    const peers = await ipfs.pubsub.peers(topic)

    return peers.map(p => p.toString()).includes(remoteId.id.toString())
  })
}

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testPublish (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.publish', function () {
    this.timeout(80 * 1000)

    /** @type {IPFS} */
    let ipfs

    /** @type {IPFS} */
    let remote

    before(async () => {
      ipfs = (await factory.spawn()).api
      remote = (await factory.spawn()).api

      // ensure we have peers to allow publishing
      const remoteId = await remote.id()
      await ipfs.swarm.connect(remoteId.addresses[0])
    })

    after(() => factory.clean())

    it('should fail with undefined msg', async () => {
      const topic = getTopic()

      await waitForRemoteToBeSubscribed(topic, ipfs, remote)

      // @ts-expect-error invalid parameter
      await expect(ipfs.pubsub.publish(topic)).to.eventually.be.rejected()
    })

    it('should publish message from buffer', async () => {
      const topic = getTopic()

      await waitForRemoteToBeSubscribed(topic, ipfs, remote)

      return ipfs.pubsub.publish(topic, uint8ArrayFromString(nanoid()))
    })

    it('should publish 10 times within time limit', async () => {
      const count = 10
      const topic = getTopic()

      await waitForRemoteToBeSubscribed(topic, ipfs, remote)

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.publish(topic, uint8ArrayFromString(nanoid()))
      }
    })
  })
}
