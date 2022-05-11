import keyExport from './export.js'
import keyGen from './gen.js'
import keyImport from './import.js'
import keyList from './list.js'
import keyRename from './rename.js'
import keyRm from './rm.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  keyExport,
  keyGen,
  keyImport,
  keyList,
  keyRename,
  keyRm
]
