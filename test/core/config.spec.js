/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const Config = require('../../src/core/config')

describe('config', () => {
  it('should allow empty config', () => {
    const config = {}
    expect(() => Config.validate(config)).to.not.throw()
  })

  it('should allow undefined config', () => {
    const config = undefined
    expect(() => Config.validate(config)).to.not.throw()
  })

  it('should allow unknown key at root', () => {
    const config = { [`${Date.now()}`]: 'test' }
    expect(() => Config.validate(config)).to.not.throw()
  })

  it('should validate valid repo', () => {
    const configs = [
      { repo: { unknown: 'value' } },
      { repo: '/path/to-repo' },
      { repo: null },
      { repo: undefined }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.not.throw())
  })

  it('should validate invalid repo', () => {
    const configs = [
      { repo: 138 }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.throw())
  })

  it('should validate valid init', () => {
    const configs = [
      { init: { bits: 138 } },
      { init: { bits: 138, unknown: 'value' } },
      { init: true },
      { init: false },
      { init: null },
      { init: undefined }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.not.throw())
  })

  it('should validate invalid init', () => {
    const configs = [
      { init: 138 },
      { init: { bits: 'not an int' } }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.throw())
  })

  it('should validate valid start', () => {
    const configs = [
      { start: true },
      { start: false },
      { start: undefined }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.not.throw())
  })

  it('should validate invalid start', () => {
    const configs = [
      { start: 138 },
      { start: 'make it so number 1' },
      { start: null }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.throw())
  })

  it('should validate valid pass', () => {
    const configs = [
      { pass: 'correctbatteryhorsestaple' },
      { pass: '' },
      { pass: undefined }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.not.throw())
  })

  it('should validate invalid pass', () => {
    const configs = [
      { pass: 138 },
      { pass: null }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.throw())
  })

  it('should validate valid EXPERIMENTAL', () => {
    const configs = [
      { EXPERIMENTAL: { pubsub: true, dht: true, sharding: true } },
      { EXPERIMENTAL: { pubsub: false, dht: false, sharding: false } },
      { EXPERIMENTAL: { unknown: 'value' } },
      { EXPERIMENTAL: null },
      { EXPERIMENTAL: undefined }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.not.throw())
  })

  it('should validate invalid EXPERIMENTAL', () => {
    const configs = [
      { EXPERIMENTAL: { pubsub: 138 } },
      { EXPERIMENTAL: { dht: 138 } },
      { EXPERIMENTAL: { sharding: 138 } }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.throw())
  })

  it('should validate valid config', () => {
    const configs = [
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

    configs.forEach(c => expect(() => Config.validate(c)).to.not.throw())
  })

  it('should validate invalid config', () => {
    const configs = [
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

    configs.forEach(c => expect(() => Config.validate(c)).to.throw())
  })

  it('should validate valid libp2p', () => {
    const configs = [
      { libp2p: { modules: {} } },
      { libp2p: { modules: { unknown: 'value' } } },
      { libp2p: { modules: null } },
      { libp2p: { modules: undefined } },
      { libp2p: { unknown: 'value' } },
      { libp2p: null },
      { libp2p: undefined }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.not.throw())
  })

  it('should validate invalid libp2p', () => {
    const configs = [
      { libp2p: { modules: 138 } },
      { libp2p: 138 }
    ]

    configs.forEach(c => expect(() => Config.validate(c)).to.throw())
  })
})
