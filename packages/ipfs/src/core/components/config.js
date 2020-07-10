'use strict'

const getDefaultConfig = require('../runtime/config-nodejs.js')
const { withTimeoutOption } = require('../utils')
const log = require('debug')('ipfs:core:config')

module.exports = ({ repo }) => {
  return {
    getAll: withTimeoutOption(repo.config.getAll),
    get: withTimeoutOption((key, options) => {
      if (!key) {
        return Promise.reject(new Error('key argument is required'))
      }

      return repo.config.get(key, options)
    }),
    set: withTimeoutOption(repo.config.set),
    replace: withTimeoutOption(repo.config.replace),
    profiles: {
      apply: withTimeoutOption(applyProfile),
      list: withTimeoutOption(listProfiles)
    }
  }

  async function applyProfile (profileName, options = {}) {
    const { dryRun } = options

    const profile = profiles[profileName]

    if (!profile) {
      throw new Error(`No profile with name '${profileName}' exists`)
    }

    try {
      const oldCfg = await repo.config.getAll(options)
      let newCfg = JSON.parse(JSON.stringify(oldCfg)) // clone
      newCfg = profile.transform(newCfg)

      if (!dryRun) {
        await repo.config.replace(newCfg, options)
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
    description: 'Recommended for nodes with public IPv4 address (servers, VPSes, etc.), disables host and content discovery in local networks.',
    transform: (config) => {
      config.Discovery.MDNS.Enabled = false
      config.Discovery.webRTCStar.Enabled = false

      return config
    }
  },
  'local-discovery': {
    description: 'Sets default values to fields affected by `server` profile, enables discovery in local networks.',
    transform: (config) => {
      config.Discovery.MDNS.Enabled = true
      config.Discovery.webRTCStar.Enabled = true

      return config
    }
  },
  test: {
    description: 'Reduces external interference, useful for running ipfs in test environments. Note that with these settings node won\'t be able to talk to the rest of the network without manual bootstrap.',
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      config.Addresses.API = defaultConfig.Addresses.API ? '/ip4/127.0.0.1/tcp/0' : ''
      config.Addresses.Gateway = defaultConfig.Addresses.Gateway ? '/ip4/127.0.0.1/tcp/0' : ''
      config.Addresses.Swarm = defaultConfig.Addresses.Swarm.length ? ['/ip4/127.0.0.1/tcp/0'] : []
      config.Addresses.Delegates = []
      config.Bootstrap = []
      config.Discovery.MDNS.Enabled = false
      config.Discovery.webRTCStar.Enabled = false

      return config
    }
  },
  'default-networking': {
    description: 'Restores default network settings. Inverse profile of the `test` profile.',
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      config.Addresses.API = defaultConfig.Addresses.API
      config.Addresses.Gateway = defaultConfig.Addresses.Gateway
      config.Addresses.Swarm = defaultConfig.Addresses.Swarm
      config.Addresses.Delegates = defaultConfig.Addresses.Delegates
      config.Bootstrap = defaultConfig.Bootstrap
      config.Discovery.MDNS.Enabled = defaultConfig.Discovery.MDNS.Enabled
      config.Discovery.webRTCStar.Enabled = defaultConfig.Discovery.webRTCStar.Enabled

      return config
    }
  },
  lowpower: {
    description: 'Reduces daemon overhead on the system. May affect node functionality,performance of content discovery and data fetching may be degraded. Recommended for low power systems.',
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
  }

}

module.exports.profiles = profiles
