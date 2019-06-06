'use strict'

const promisify = require('promisify-es6')
const defaultConfig = require('../runtime/config-nodejs.js')()

module.exports = function config (self) {
  return {
    get: promisify((key, callback) => {
      if (typeof key === 'function') {
        callback = key
        key = undefined
      }

      return self._repo.config.get(key, callback)
    }),
    set: promisify((key, value, callback) => {
      self._repo.config.set(key, value, callback)
    }),
    replace: promisify((config, callback) => {
      self._repo.config.set(config, callback)
    }),
    profile: promisify(applyProfile)
  }

  async function applyProfile (profileName, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    const { dryRun } = opts

    const profile = profiles.find(p => p.name === profileName)
    if (!profile) {
      return callback(new Error(`No profile with name '${profileName}' exists`))
    }

    try {
      const oldCfg = await self.config.get()
      const newCfg = JSON.parse(JSON.stringify(oldCfg)) // clone
      profile.transform(newCfg)
      if (!dryRun) {
        await self.config.replace(newCfg)
      }

      // Scrub private key from output
      delete oldCfg.Identity.PrivKey
      delete newCfg.Identity.PrivKey

      callback(null, { oldCfg, newCfg })
    } catch (err) {
      callback(new Error(`Could not apply profile '${profileName}' to config: ${err.message}`))
    }
  }
}

const profiles = [{
  name: 'server',
  description: 'Disables local host discovery - recommended when running IPFS on machines with public IPv4 addresses.',
  transform: (config) => {
    config.Discovery.MDNS.Enabled = false
    config.Discovery.webRTCStar.Enabled = false
  }
}, {
  name: 'local-discovery',
  description: 'Enables local host discovery - inverse of "server" profile.',
  transform: (config) => {
    config.Discovery.MDNS.Enabled = true
    config.Discovery.webRTCStar.Enabled = true
  }
}, {
  name: 'test',
  description: 'Reduces external interference of IPFS daemon - for running the daemon in test environments.',
  transform: (config) => {
    config.Addresses.API = defaultConfig.Addresses.API ? '/ip4/127.0.0.1/tcp/0' : ''
    config.Addresses.Gateway = defaultConfig.Addresses.Gateway ? '/ip4/127.0.0.1/tcp/0' : ''
    config.Addresses.Swarm = defaultConfig.Addresses.Swarm.length ? ['/ip4/127.0.0.1/tcp/0'] : []
    config.Bootstrap = []
    config.Discovery.MDNS.Enabled = false
    config.Discovery.webRTCStar.Enabled = false
  }
}, {
  name: 'default-networking',
  description: 'Restores default network settings - inverse of "test" profile.',
  transform: (config) => {
    console.log('applying default-networking')
    console.log('setting to', defaultConfig.Addresses)
    config.Addresses.API = defaultConfig.Addresses.API
    config.Addresses.Gateway = defaultConfig.Addresses.Gateway
    config.Addresses.Swarm = defaultConfig.Addresses.Swarm
    config.Bootstrap = defaultConfig.Bootstrap
    config.Discovery.MDNS.Enabled = defaultConfig.Discovery.MDNS.Enabled
    config.Discovery.webRTCStar.Enabled = defaultConfig.Discovery.webRTCStar.Enabled
  }
}, {
  name: 'lowpower',
  description: 'Reduces daemon overhead on the system - recommended for low power systems.',
  transform: (config) => {
    config.Swarm = config.Swarm || {}
    config.Swarm.ConnMgr = config.Swarm.ConnMgr || {}
    config.Swarm.ConnMgr.LowWater = 20
    config.Swarm.ConnMgr.HighWater = 40
  }
}, {
  name: 'default-power',
  description: 'Inverse of "lowpower" profile.',
  transform: (config) => {
    config.Swarm = defaultConfig.Swarm
  }
}]

module.exports.profiles = profiles
