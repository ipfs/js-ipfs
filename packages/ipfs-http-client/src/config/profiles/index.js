import { createApply } from './apply.js'
import { createList } from './list.js'

/**
 * @param {import('../../types').Options} config
 */
export function createProfiles (config) {
  return {
    apply: createApply(config),
    list: createList(config)
  }
}
