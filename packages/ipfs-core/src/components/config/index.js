import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { logger } from '@libp2p/logger'
import { profiles } from './profiles.js'

const log = logger('ipfs:core:config')

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createConfig ({ repo }) {
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
   * @type {import('ipfs-core-types/src/config').API<{}>["getAll"]}
   */
  async function getAll (options = {}) { // eslint-disable-line require-await
    return repo.config.getAll(options)
  }

  /**
   * @type {import('ipfs-core-types/src/config').API<{}>["get"]}
   */
  async function get (key, options) { // eslint-disable-line require-await
    if (!key) {
      return Promise.reject(new Error('key argument is required'))
    }

    return repo.config.get(key, options)
  }

  /**
   * @type {import('ipfs-core-types/src/config').API<{}>["set"]}
   */
  async function set (key, value, options) { // eslint-disable-line require-await
    return repo.config.set(key, value, options)
  }

  /**
   * @type {import('ipfs-core-types/src/config').API<{}>["replace"]}
   */
  async function replace (value, options) { // eslint-disable-line require-await
    return repo.config.replace(value, options)
  }

  /**
   * @type {import('ipfs-core-types/src/config/profiles').API<{}>["apply"]}
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
      // @ts-expect-error `oldCfg.Identity` maybe undefined
      delete oldCfg.Identity.PrivKey
      delete newCfg.Identity.PrivKey

      return { original: oldCfg, updated: newCfg }
    } catch (/** @type {any} */ err) {
      log(err)

      throw new Error(`Could not apply profile '${profileName}' to config: ${err.message}`)
    }
  }
}

/**
 * @type {import('ipfs-core-types/src/config/profiles').API<{}>["list"]}
 */
async function listProfiles (_options) { // eslint-disable-line require-await
  return Object.keys(profiles).map(name => ({
    name,
    description: profiles[name].description
  }))
}
