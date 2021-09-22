import { createData } from './data.js'
import { createGet } from './get.js'
import { createLinks } from './links.js'
import { createNew } from './new.js'
import { createPut } from './put.js'
import { createStat } from './stat.js'
import { createPatch } from './patch/index.js'

/**
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
 * @param {import('../types').Options} config
 */
export function createObject (codecs, config) {
  return {
    data: createData(config),
    get: createGet(config),
    links: createLinks(config),
    new: createNew(config),
    put: createPut(codecs, config),
    stat: createStat(config),
    patch: createPatch(config)
  }
}
