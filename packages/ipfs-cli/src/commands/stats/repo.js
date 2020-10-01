'use strict'

// This is an alias for `repo stat`.
const repoStats = require('../repo/stat.js')

module.exports = {
  ...repoStats,

  // The command needs to be renamed, else it would be `stats stat` instead of
  // `stats repo`
  command: 'repo'
}
