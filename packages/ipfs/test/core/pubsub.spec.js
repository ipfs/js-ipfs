/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { Buffer } = require('buffer')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const IPFS = require('../../src')
const createTempRepo = require('../utils/create-repo-nodejs')

describe('pubsub disabled', () => {
  let ipfs
  let repo

  before(async function () {
    this.timeout(20 * 1000)

    repo = createTempRepo()
    ipfs = await IPFS.create({
      silent: true,
      repo,
      config: {
        Addresses: {
          Swarm: []
        },
        Pubsub: {
          Enabled: false
        }
      },
      preload: {
        enabled: false
      }
    })
  })

  after(() => ipfs.stop())

  after(() => repo.teardown())

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
    const msg = Buffer.from(nanoid())

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
