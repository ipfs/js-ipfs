'use strict'

const set = require('just-safe-set')
const getDefaultConfig = require('../runtime/config-nodejs.js')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const log = require('debug')('ipfs:core:config')

/**
 * @typedef {import('ipfs-core-types/src/config').Config} Config
 *
 * @typedef {object} Transformer
 * @property {string} description
 * @property {(config: Config) => Config} transform
 */

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
 */
module.exports = ({ repo }) => {
  return {
    getAll: withTimeoutOption(getAll),
    get: withTimeoutOption(get),
    set: withTimeoutOption(set),
    replace: withTimeoutOption(replace),
    profiles: {
      apply: withTimeoutOption(applyProfile),
      list: withTimeoutOption(listProfiles)
    }
  }

  /**
   * @type {import('ipfs-core-types/src/config').API["getAll"]}
   */
  async function getAll (options = {}) { // eslint-disable-line require-await
    // @ts-ignore TODO: move config typedefs into ipfs-repo
    return repo.config.getAll(options)
  }

  /**
   * @type {import('ipfs-core-types/src/config').API["get"]}
   */
  async function get (key, options) { // eslint-disable-line require-await
    if (!key) {
      return Promise.reject(new Error('key argument is required'))
    }

    // @ts-ignore TODO: move config typedefs into ipfs-repo
    return repo.config.get(key, options)
  }

  /**
   * @type {import('ipfs-core-types/src/config').API["set"]}
   */
  async function set (key, value, options) { // eslint-disable-line require-await
    return repo.config.set(key, value, options)
  }

  /**
   * @type {import('ipfs-core-types/src/config').API["replace"]}
   */
  async function replace (value, options) { // eslint-disable-line require-await
    return repo.config.replace(value, options)
  }

  /**
   * @type {import('ipfs-core-types/src/config/profiles').API["apply"]}
   */
  async function applyProfile (profileName, options = { dryRun: false }) {
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
      // @ts-ignore `oldCfg.Identity` maybe undefined
      delete oldCfg.Identity.PrivKey
      delete newCfg.Identity.PrivKey

      // @ts-ignore TODO: move config typedefs into ipfs-repo
      return { original: oldCfg, updated: newCfg }
    } catch (err) {
      log(err)

      throw new Error(`Could not apply profile '${profileName}' to config: ${err.message}`)
    }
  }
}

/**
 * @type {import('ipfs-core-types/src/config/profiles').API["list"]}
 */
async function listProfiles (_options) { // eslint-disable-line require-await
  return Object.keys(profiles).map(name => ({
    name,
    description: profiles[name].description
  }))
}

/**
 * @type {Record<string, Transformer>}
 */
const profiles = {
  server: {
    description: 'Recommended for nodes with public IPv4 address (servers, VPSes, etc.), disables host and content discovery and UPnP in local networks.',
    transform: (config) => {
      set(config, 'Discovery.MDNS.Enabled', false)
      set(config, 'Discovery.webRTCStar.Enabled', false)
      config.Swarm = {
        ...(config.Swarm || {}),
        DisableNatPortMap: true
      }

      return config
    }
  },
  'local-discovery': {
    description: 'Sets default values to fields affected by `server` profile, enables discovery and UPnP in local networks.',
    transform: (config) => {
      set(config, 'Discovery.MDNS.Enabled', true)
      set(config, 'Discovery.webRTCStar.Enabled', true)
      set(config, 'Swarm', {
        ...(config.Swarm || {}),
        DisableNatPortMap: false
      })

      return config
    }
  },
  test: {
    description: 'Reduces external interference, useful for running ipfs in test environments. Note that with these settings node won\'t be able to talk to the rest of the network without manual bootstrap.',
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      set(config, 'Addresses.API', defaultConfig.Addresses.API ? '/ip4/127.0.0.1/tcp/0' : '')
      set(config, 'Addresses.Gateway', defaultConfig.Addresses.Gateway ? '/ip4/127.0.0.1/tcp/0' : '')
      set(config, 'Addresses.Swarm', defaultConfig.Addresses.Swarm.length ? ['/ip4/127.0.0.1/tcp/0'] : [])
      set(config, 'Addresses.Delegates', [])
      set(config, 'Bootstrap', [])
      set(config, 'Discovery.MDNS.Enabled', false)
      set(config, 'Discovery.webRTCStar.Enabled', false)
      set(config, 'Swarm', {
        ...(config.Swarm || {}),
        DisableNatPortMap: true
      })

      return config
    }
  },
  'default-networking': {
    description: 'Restores default network settings. Inverse profile of the `test` profile.',
    transform: (config) => {
      const defaultConfig = getDefaultConfig()

      set(config, 'Addresses.API', defaultConfig.Addresses.API)
      set(config, 'Addresses.Gateway', defaultConfig.Addresses.Gateway)
      set(config, 'Addresses.Swarm', defaultConfig.Addresses.Swarm)
      set(config, 'Addresses.Delegates', defaultConfig.Addresses.Delegates)
      set(config, 'Bootstrap', defaultConfig.Bootstrap)
      set(config, 'Discovery.MDNS.Enabled', defaultConfig.Discovery.MDNS.Enabled)
      set(config, 'Discovery.webRTCStar.Enabled', defaultConfig.Discovery.webRTCStar.Enabled)
      set(config, 'Swarm', {
        ...(config.Swarm || {}),
        DisableNatPortMap: false
      })

      return config
    }
  },
  lowpower: {
    description: 'Reduces daemon overhead on the system. May affect node functionality,performance of content discovery and data fetching may be degraded. Recommended for low power systems.',
    transform: (config) => {
      const Swarm = config.Swarm || {}
      const ConnMgr = Swarm.ConnMgr || {}
      ConnMgr.LowWater = 20
      ConnMgr.HighWater = 40

      Swarm.ConnMgr = ConnMgr
      config.Swarm = Swarm

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
