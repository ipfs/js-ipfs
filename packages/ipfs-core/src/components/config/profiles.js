import set from 'just-safe-set'
import getDefaultConfig from 'ipfs-core-config/config'

/**
 * @typedef {import('ipfs-core-types/src/config').Config} Config
 *
 * @typedef {object} Transformer
 * @property {string} description
 * @property {(config: Config) => Config} transform
 */

/**
 * @type {Record<string, Transformer>}
 */
export const profiles = {
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
