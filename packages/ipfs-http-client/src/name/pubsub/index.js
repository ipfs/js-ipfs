import { createCancel } from './cancel.js'
import { createState } from './state.js'
import { createSubs } from './subs.js'

/**
 * @param {import('../../types').Options} config
 */
export function createPubsub (config) {
  return {
    cancel: createCancel(config),
    state: createState(config),
    subs: createSubs(config)
  }
}
