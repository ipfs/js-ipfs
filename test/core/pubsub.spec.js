/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

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
        }
      },
      preload: {
        enabled: false
      },
      EXPERIMENTAL: {
        pubsub: false
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
    try {
      const topic = hat()
      const handler = () => { throw new Error('unexpected message') }
      await ipfs.pubsub.subscribe(topic, handler)
    } catch (err) {
      return expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
    }
    throw new Error('expected error to be thrown')
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
    try {
      const topic = hat()
      const handler = () => { throw new Error('unexpected message') }
      await ipfs.pubsub.unsubscribe(topic, handler)
    } catch (err) {
      return expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
    }
    throw new Error('expected error to be thrown')
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
    try {
      const topic = hat()
      const msg = Buffer.from(hat())
      await ipfs.pubsub.publish(topic, msg)
    } catch (err) {
      return expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
    }
    throw new Error('expected error to be thrown')
  })

  it('should not allow ls if disabled', done => {
    ipfs.pubsub.ls((err) => {
      expect(err).to.exist()
      expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
      done()
    })
  })

  it('should not allow ls if disabled (promised)', async () => {
    try {
      await ipfs.pubsub.ls()
    } catch (err) {
      return expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
    }
    throw new Error('expected error to be thrown')
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
    try {
      const topic = hat()
      await ipfs.pubsub.peers(topic)
    } catch (err) {
      return expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
    }
    throw new Error('expected error to be thrown')
  })

  it('should not allow setMaxListeners if disabled', async () => {
    try {
      await ipfs.pubsub.setMaxListeners(100)
    } catch (err) {
      return expect(err.code).to.equal('ERR_PUBSUB_DISABLED')
    }
    throw new Error('expected error to be thrown')
  })
})
