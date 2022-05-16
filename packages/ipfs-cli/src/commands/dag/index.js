import dagExport from './export.js'
import dagGet from './get.js'
import dagImport from './import.js'
import dagPut from './put.js'
import dagResolve from './resolve.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  dagExport,
  dagGet,
  dagImport,
  dagPut,
  dagResolve
]
