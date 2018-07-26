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

  it('should allow unknown key at root', () => {
    const cfg = { [`${Date.now()}`]: 'test' }
    expect(() => config.validate(cfg)).to.not.throw()
  })

  it('should validate valid repo', () => {
    const cfgs = [
      { repo: { unknown: 'value' } },
      { repo: '/path/to-repo' },
      { repo: null },
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
      { init: { bits: 138, unknown: 'value' } },
      { init: true },
      { init: false },
      { init: null },
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

  it('should validate valid relay', () => {
    const cfgs = [
      { relay: { enabled: true, hop: { enabled: true } } },
      { relay: { enabled: false, hop: { enabled: false } } },
      { relay: { enabled: false, hop: null } },
      { relay: { enabled: false } },
      { relay: null },
      { relay: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid relay', () => {
    const cfgs = [
      { relay: 138 },
      { relay: { enabled: 138 } },
      { relay: { enabled: true, hop: 138 } },
      { relay: { enabled: true, hop: { enabled: 138 } } }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })

  it('should validate valid EXPERIMENTAL', () => {
    const cfgs = [
      { EXPERIMENTAL: { pubsub: true, dht: true, sharding: true } },
      { EXPERIMENTAL: { pubsub: false, dht: false, sharding: false } },
      { EXPERIMENTAL: { unknown: 'value' } },
      { EXPERIMENTAL: null },
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

      { config: { Addresses: { unknown: 'value' } } },
      { config: { Addresses: null } },
      { config: { Addresses: undefined } },

      { config: { Discovery: { MDNS: { Enabled: true } } } },
      { config: { Discovery: { MDNS: { Enabled: false } } } },
      { config: { Discovery: { MDNS: { Interval: 138 } } } },
      { config: { Discovery: { MDNS: { unknown: 'value' } } } },
      { config: { Discovery: { MDNS: null } } },
      { config: { Discovery: { MDNS: undefined } } },

      { config: { Discovery: { webRTCStar: { Enabled: true } } } },
      { config: { Discovery: { webRTCStar: { Enabled: false } } } },
      { config: { Discovery: { webRTCStar: { unknown: 'value' } } } },
      { config: { Discovery: { webRTCStar: null } } },
      { config: { Discovery: { webRTCStar: undefined } } },

      { config: { Discovery: { unknown: 'value' } } },
      { config: { Discovery: null } },
      { config: { Discovery: undefined } },

      { config: { Bootstrap: ['/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'] } },
      { config: { Bootstrap: [] } },

      { config: { unknown: 'value' } },
      { config: null },
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
      { libp2p: { modules: { unknown: 'value' } } },
      { libp2p: { modules: null } },
      { libp2p: { modules: undefined } },
      { libp2p: { unknown: 'value' } },
      { libp2p: () => {} },
      { libp2p: null },
      { libp2p: undefined }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.not.throw())
  })

  it('should validate invalid libp2p', () => {
    const cfgs = [
      { libp2p: { modules: 138 } },
      { libp2p: 138 }
    ]

    cfgs.forEach(cfg => expect(() => config.validate(cfg)).to.throw())
  })
})
