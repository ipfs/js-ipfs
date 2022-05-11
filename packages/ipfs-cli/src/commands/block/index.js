import blockGet from './get.js'
import blockPut from './put.js'
import blockRm from './rm.js'
import blockStat from './stat.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  blockGet,
  blockPut,
  blockRm,
  blockStat
]
