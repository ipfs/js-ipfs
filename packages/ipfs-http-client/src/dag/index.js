import { createExport } from './export.js'
import { createGet } from './get.js'
import { createImport } from './import.js'
import { createPut } from './put.js'
import { createResolve } from './resolve.js'

/**
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
 * @param {import('../types').Options} config
 */
export function createDag (codecs, config) {
  return {
    export: createExport(config),
    get: createGet(codecs, config),
    import: createImport(config),
    put: createPut(codecs, config),
    resolve: createResolve(config)
  }
}
