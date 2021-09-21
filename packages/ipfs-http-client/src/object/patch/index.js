import { createAddLink } from './add-link.js'
import { createAppendData } from './append-data.js'
import { createRmLink } from './rm-link.js'
import { createSetData } from './set-data.js'

/**
 * @param {import('../../types').Options} config
 */
export function createPatch (config) {
  return {
    addLink: createAddLink(config),
    appendData: createAppendData(config),
    rmLink: createRmLink(config),
    setData: createSetData(config)
  }
}
