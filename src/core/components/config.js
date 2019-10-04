'use strict'

const callbackify = require('callbackify')
const getDefaultConfig = require('../runtime/config-nodejs.js')
const log = require('debug')('ipfs:core:config')

module.exports = function config (self) {
  return {
    get: callbackify.variadic(self._repo.config.get),
    set: callbackify(self._repo.config.set),
    replace: callbackify.variadic(self._repo.config.set),
    profiles: {
      apply: callbackify.variadic(applyProfile),
      list: callbackify.variadic(listProfiles)
    }
  }

  async function applyProfile (profileName, opts) {
    opts = opts || {}
    const { dryRun } = opts

    const profile = profiles[profileName]

    if (!profile) {
      throw new Error(`No profile with name '${profileName}' exists`)
    }

    try {
      const oldCfg = await self.config.get()
      let newCfg = JSON.parse(JSON.stringify(oldCfg)) // clone
      newCfg = profile.transform(newCfg)

      if (!dryRun) {
        await self.config.replace(newCfg)
      }

      // Scrub private key from output
      delete oldCfg.Identity.PrivKey
      delete newCfg.Identity.PrivKey

      return { original: oldCfg, updated: newCfg }
    } catch (err) {
      log(err)

      throw new Error(`Could not apply profile '${profileName}' to config: ${err.message}`)
    }
  }
}

async function listProfiles (options) { // eslint-disable-line require-await
  return Object.keys(profiles).map(name => ({
    name,
    description: profiles[name].description
  }))
}

const profiles = {
  server: {
    description: 'Disables local host discovery - recommended when running IPFS on machines with public IPv4 addresses.',
    transform: (config) => {
      config.Discovery.MDNS.Enabled = false
      config.Discovery.webRTCStar.Enabled = false

      return config
    }
  },
  'local-discovery': {
    description: 'Enables local host discovery - inverse of "server" profile.',
    transform: (config) => {
      config.Discovery.MDNS.Enabled = true
      config.Discovery.webRTCStar.Enabled = true

      return config
    }
  },
  lowpower: {
    description: 'Reduces daemon overhead on the system - recommended for low power systems.',
    transform: (config) => {
      config.Swarm = config.Swarm || {}
      config.Swarm.ConnMgr = config.Swarm.ConnMgr || {}
      config.Swarm.ConnMgr.LowWater = 20
      config.Swarm.ConnMgr.HighWater = 40

      return config
    }
  },
  'default-power': {
    description: 'Inverse of "lowpower" profile.',
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      config.Swarm = defaultConfig.Swarm

      return config
    }
  },
  test: {
    description: 'Reduces external interference of IPFS daemon - for running the daemon in test environments.',
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      config.Addresses.API = defaultConfig.Addresses.API ? '/ip4/127.0.0.1/tcp/0' : ''
      config.Addresses.Gateway = defaultConfig.Addresses.Gateway ? '/ip4/127.0.0.1/tcp/0' : ''
      config.Addresses.Swarm = defaultConfig.Addresses.Swarm.length ? ['/ip4/127.0.0.1/tcp/0'] : []
      config.Bootstrap = []
      config.Discovery.MDNS.Enabled = false
      config.Discovery.webRTCStar.Enabled = false

      return config
    }
  },
  'default-networking': {
    description: 'Restores default network settings - inverse of "test" profile.',
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      config.Addresses.API = defaultConfig.Addresses.API
      config.Addresses.Gateway = defaultConfig.Addresses.Gateway
      config.Addresses.Swarm = defaultConfig.Addresses.Swarm
      config.Bootstrap = defaultConfig.Bootstrap
      config.Discovery.MDNS.Enabled = defaultConfig.Discovery.MDNS.Enabled
      config.Discovery.webRTCStar.Enabled = defaultConfig.Discovery.webRTCStar.Enabled

      return config
    }
  }
}

module.exports.profiles = profiles
