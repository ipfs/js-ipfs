import { createExport } from './export.js'
import { createGen } from './gen.js'
import { createImport } from './import.js'
import { createInfo } from './info.js'
import { createList } from './list.js'
import { createRename } from './rename.js'
import { createRm } from './rm.js'

/**
 * @param {import('../types').Options} config
 */
export function createKey (config) {
  return {
    export: createExport(config),
    gen: createGen(config),
    import: createImport(config),
    info: createInfo(config),
    list: createList(config),
    rename: createRename(config),
    rm: createRm(config)
  }
}
