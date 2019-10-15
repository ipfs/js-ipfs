/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const IPFS = require('../../src')
const createTempRepo = require('../utils/create-repo-nodejs')

describe('pubsub disabled', () => {
  let ipfs
  let repo

  before(function (done) {
    this.timeout(20 * 1000)

    repo = createTempRepo()
    ipfs = new IPFS({
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

    ipfs.on('ready', done)
  })

  after((done) => ipfs.stop(done))

  after((done) => repo.teardown(done))

  it('should not allow subscribe if disabled', done => {
    const topic = hat()
    const handler = () => done(new Error('unexpected message'))
    ipfs.pubsub.subscribe(topic, handler, (err) => {
      expect(err).to.exist()
      expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
      done()
    })
  })

  it('should not allow subscribe if disabled (promised)', async () => {
    const topic = hat()
    const handler = () => { throw new Error('unexpected message') }

    await expect(ipfs.pubsub.subscribe(topic, handler))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_PUBSUB_DISABLED')
  })

  it('should not allow unsubscribe if disabled', done => {
    const topic = hat()
    const handler = () => done(new Error('unexpected message'))
    ipfs.pubsub.unsubscribe(topic, handler, (err) => {
      expect(err).to.exist()
      expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
      done()
    })
  })

  it('should not allow unsubscribe if disabled (promised)', async () => {
    const topic = hat()
    const handler = () => { throw new Error('unexpected message') }

    await expect(ipfs.pubsub.unsubscribe(topic, handler))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_PUBSUB_DISABLED')
  })

  it('should not allow publish if disabled', done => {
    const topic = hat()
    const msg = Buffer.from(hat())
    ipfs.pubsub.publish(topic, msg, (err) => {
      expect(err).to.exist()
      expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
      done()
    })
  })

  it('should not allow publish if disabled (promised)', async () => {
    const topic = hat()
    const msg = Buffer.from(hat())

    await expect(ipfs.pubsub.publish(topic, msg))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_PUBSUB_DISABLED')
  })

  it('should not allow ls if disabled', done => {
    ipfs.pubsub.ls((err) => {
      expect(err).to.exist()
      expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
      done()
    })
  })

  it('should not allow ls if disabled (promised)', async () => {
    await expect(ipfs.pubsub.ls())
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_PUBSUB_DISABLED')
  })

  it('should not allow peers if disabled', done => {
    const topic = hat()
    ipfs.pubsub.peers(topic, (err) => {
      expect(err).to.exist()
      expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
      done()
    })
  })

  it('should not allow peers if disabled (promised)', async () => {
    const topic = hat()

    await expect(ipfs.pubsub.peers(topic))
      .to.eventually.be.rejected()
      .and.to.have.property('code', 'ERR_PUBSUB_DISABLED')
  })

  it('should not allow setMaxListeners if disabled', () => {
    try {
      ipfs.pubsub.setMaxListeners(100)
    } catch (err) {
      return expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
    }
    throw new Error('expected error to be thrown')
  })
})
