import { createProfiles } from './profiles/index.js'
import { createGet } from './get.js'
import { createGetAll } from './get-all.js'
import { createReplace } from './replace.js'
import { createSet } from './set.js'

/**
 * @param {import('../types').Options} config
 */
export function createConfig (config) {
  return {
    getAll: createGetAll(config),
    get: createGet(config),
    set: createSet(config),
    replace: createReplace(config),
    profiles: createProfiles(config)
  }
}
