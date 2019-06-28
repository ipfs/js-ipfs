/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const sinon = require('sinon')

const CID = require('cids')

const IPFS = require('../../src')
const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc' })

const DELAY = '3s'
const INTERVAL = '10s'
const STRATEGY = 'all'

const config = {
  Bootstrap: [],
  Reprovider: {
    Delay: DELAY,
    Interval: INTERVAL,
    Strategy: STRATEGY
  }
}

describe('record provider', () => {
  // if no dht nor delegated routing enabled
  describe('disabled', () => {
    let node
    let ipfsd

    before(function (done) {
      this.timeout(50 * 1000)

      df.spawn({
        exec: IPFS
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        node = _ipfsd.api

        done()
      })
    })

    after((done) => {
      ipfsd.stop(done)
    })

    it('should not be running', () => {
      expect(node._provider._running).to.equal(false)
      expect(node._provider.reprovider).to.not.exist()
    })
  })

  describe('enabled with default configuration', () => {
    let node
    let ipfsd

    before(function (done) {
      this.timeout(50 * 1000)

      df.spawn({
        exec: IPFS,
        libp2p: {
          config: {
            dht: {
              enabled: true
            }
          }
        }
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        node = _ipfsd.api

        done()
      })
    })

    after((done) => {
      ipfsd.stop(done)
    })

    it('should be running', () => {
      expect(node._provider._running).to.equal(true)
      expect(node._provider.reprovider).to.exist()
      expect(node._provider.reprovider._timeoutId).to.exist()
    })

    it('should use the defaults', () => {
      expect(node._provider._options.Interval).to.equal('12h')
      expect(node._provider._options.Strategy).to.equal('all')
    })

    it('should be able to provide a valid CIDs', async () => {
      const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

      try {
        await node._provider.provide(cid)
      } catch (err) {
        expect(err).to.not.exist()
        throw err
      }
    })

    it('should thrown providing an invalid CIDs', async () => {
      const cid = 'Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'

      try {
        await node._provider.provide(cid)
      } catch (err) {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
      }
    })

    it('should be able to find providers of a valid CID', async () => {
      const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

      let providers
      try {
        providers = await node._provider.findProviders(cid)
      } catch (err) {
        expect(err).to.not.exist()
        throw err
      }

      expect(providers).to.exist()
    })

    it('should thrown finding providers of an invalid CID', async () => {
      const cid = 'Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ'

      try {
        await node._provider.findProviders(cid)
      } catch (err) {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_CID')
      }
    })
  })

  describe('enabled with custom config', () => {
    let node
    let ipfsd

    before(function (done) {
      this.timeout(50 * 1000)

      df.spawn({
        exec: IPFS,
        config,
        libp2p: {
          config: {
            dht: {
              enabled: true
            }
          }
        }
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        node = _ipfsd.api

        done()
      })
    })

    after((done) => {
      ipfsd.stop(done)
    })

    it('should be running', () => {
      expect(node._provider._running).to.equal(true)
      expect(node._provider.reprovider).to.exist()
      expect(node._provider.reprovider._timeoutId).to.exist()
    })

    it('should use the provided configuration', () => {
      expect(node._provider._options.Interval).to.equal(INTERVAL)
      expect(node._provider._options.Strategy).to.equal(STRATEGY)
    })

    it('should reprovide after tens seconds', function (done) {
      this.timeout(20 * 1000)

      const reprovider = node._provider.reprovider
      sinon.spy(reprovider, '_runPeriodically')
      sinon.spy(reprovider._worker, '_processNext')

      setTimeout(() => {
        expect(reprovider._runPeriodically.called).to.equal(true)
        expect(reprovider._worker._processNext.called).to.equal(true)

        sinon.restore()
        done()
      }, 10000)
    })
  })

  describe.skip('reprovide strategies', () => {

  })
})
