/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expect } from 'aegir/utils/chai.js'
import createNode from './utils/create-node.js'

describe('pubsub disabled', () => {
  /** @type {import('ipfs-core-types').IPFS} */
  let ipfs
  /** @type {() => Promise<void>} */
  let cleanup

  before(async () => {
    const res = await createNode({
      config: {
        Pubsub: {
          Enabled: false
        }
      }
    })
    ipfs = res.ipfs
    cleanup = res.cleanup
  })

  after(() => cleanup())

  it('should not allow subscribe if disabled', async () => {
    const topic = nanoid()
    const handler = () => { throw new Error('unexpected message') }

    await expect(ipfs.pubsub.subscribe(topic, handler))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NOT_ENABLED')
  })

  it('should not allow unsubscribe if disabled', async () => {
    const topic = nanoid()
    const handler = () => { throw new Error('unexpected message') }

    await expect(ipfs.pubsub.unsubscribe(topic, handler))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NOT_ENABLED')
  })

  it('should not allow publish if disabled', async () => {
    const topic = nanoid()
    const msg = uint8ArrayFromString(nanoid())

    await expect(ipfs.pubsub.publish(topic, msg))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NOT_ENABLED')
  })

  it('should not allow ls if disabled', async () => {
    await expect(ipfs.pubsub.ls())
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NOT_ENABLED')
  })

  it('should not allow peers if disabled', async () => {
    const topic = nanoid()

    await expect(ipfs.pubsub.peers(topic))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_NOT_ENABLED')
  })
})
