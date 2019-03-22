/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const config = require('../../src/core/config')

describe('config', () => {
  it('should allow empty config', () => {
    const cfg = {}
    expect(() => config.validate(cfg)).to.not.throw()
  })

  it('should allow undefined config', () => {
    const cfg = undefined
    expect(() => config.validate(cfg)).to.not.throw()
  })

  it('should validate valid repo', () => {
    const cfgs = [
      { repo: { unknown: 'value' } },
      { repo: '/path/to-repo' },
      { repo: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid repo', () => {
    const cfgs = [
      { repo: 138 }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })

  it('should validate valid init', () => {
    const cfgs = [
      { init: { bits: 138 } },
      { init: true },
      { init: false },
      { init: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid init', () => {
    const cfgs = [
      { init: 138 },
      { init: { bits: 'not an int' } }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })

  it('should validate valid start', () => {
    const cfgs = [
      { start: true },
      { start: false },
      { start: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid start', () => {
    const cfgs = [
      { start: 138 },
      { start: 'make it so number 1' },
      { start: null }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })

  it('should validate valid pass', () => {
    const cfgs = [
      { pass: 'correctbatteryhorsestaple' },
      { pass: '' },
      { pass: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid pass', () => {
    const cfgs = [
      { pass: 138 },
      { pass: null }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })

  it('should validate valid EXPERIMENTAL', () => {
    const cfgs = [
      { EXPERIMENTAL: { pubsub: true, dht: true, sharding: true } },
      { EXPERIMENTAL: { pubsub: false, dht: false, sharding: false } },
      { EXPERIMENTAL: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid EXPERIMENTAL', () => {
    const cfgs = [
      { EXPERIMENTAL: { pubsub: 138 } },
      { EXPERIMENTAL: { dht: 138 } },
      { EXPERIMENTAL: { sharding: 138 } }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })

  it('should validate valid config', () => {
    const cfgs = [
      { config: { Addresses: { Swarm: ['/ip4/0.0.0.0/tcp/4002'] } } },
      { config: { Addresses: { Swarm: [] } } },
      { config: { Addresses: { Swarm: undefined } } },

      { config: { Addresses: { API: '/ip4/127.0.0.1/tcp/5002' } } },
      { config: { Addresses: { API: undefined } } },

      { config: { Addresses: { Gateway: '/ip4/127.0.0.1/tcp/9090' } } },
      { config: { Addresses: { Gateway: undefined } } },

      { config: { Addresses: undefined } },

      { config: { Discovery: { MDNS: { Enabled: true } } } },
      { config: { Discovery: { MDNS: { Enabled: false } } } },
      { config: { Discovery: { MDNS: { Interval: 138 } } } },
      { config: { Discovery: { MDNS: undefined } } },

      { config: { Discovery: { webRTCStar: { Enabled: true } } } },
      { config: { Discovery: { webRTCStar: { Enabled: false } } } },
      { config: { Discovery: { webRTCStar: undefined } } },

      { config: { Discovery: undefined } },

      { config: { Bootstrap: ['/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'] } },
      { config: { Bootstrap: [] } },

      { config: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid config', () => {
    const cfgs = [
      { config: { Addresses: { Swarm: 138 } } },
      { config: { Addresses: { Swarm: null } } },

      { config: { Addresses: { API: 138 } } },
      { config: { Addresses: { API: null } } },

      { config: { Addresses: { Gateway: 138 } } },
      { config: { Addresses: { Gateway: null } } },

      { config: { Discovery: { MDNS: { Enabled: 138 } } } },
      { config: { Discovery: { MDNS: { Interval: true } } } },

      { config: { Discovery: { webRTCStar: { Enabled: 138 } } } },

      { config: { Bootstrap: ['/ip4/0.0.0.0/tcp/4002'] } },
      { config: { Bootstrap: 138 } },

      { config: 138 }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })

  it('should validate valid libp2p', () => {
    const cfgs = [
      { libp2p: { modules: {} } },
      { libp2p: () => {} },
      { libp2p: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid libp2p', () => {
    const cfgs = [
      { libp2p: 'error' },
      { libp2p: 138 }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })
})
