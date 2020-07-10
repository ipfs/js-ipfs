'use strict'

const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const parseDuration = require('parse-duration').default
const path = require('path')

module.exports = {
  command: 'path',

  describe: 'Get path for the currently used repo',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, timeout }) {
    const stats = await ipfs.repo.stat({
      timeout
    })
    print(stats.repoPath)
  }
}
