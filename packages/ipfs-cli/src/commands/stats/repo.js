
// This is an alias for `repo stat`.
import repoStats from '../repo/stat.js'

/** @type {repoStats} */
const command = {
  ...repoStats,

  // The command needs to be renamed, else it would be `stats stat` instead of
  // `stats repo`
  command: 'repo'
}

export default command
