import objectData from './data.js'
import objectGet from './get.js'
import objectLinks from './links.js'
import objectNew from './new.js'
import objectPatch from './patch.js'
import objectPut from './put.js'
import objectStat from './stat.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  objectData,
  objectGet,
  objectLinks,
  objectNew,
  objectPatch,
  objectPut,
  objectStat
]
