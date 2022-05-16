import repoGc from './gc.js'
import repoStat from './stat.js'
import repoVersion from './version.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  repoGc,
  repoStat,
  repoVersion
]
