'use strict'

const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const { create } = require('../../src')
const createTempRepo = require('./create-repo')

/**
 * @param {import('../../src/types').Options} config
 */
module.exports = async (config = {}) => {
  const repo = await createTempRepo()
  const ipfs = await create(mergeOptions({
    silent: true,
    repo,
    config: {
      Addresses: {
        Swarm: []
      },
      Bootstrap: []
    },
    preload: {
      enabled: false
    }
  }, config))

  return {
    ipfs,
    repo,
    cleanup: async () => {
      await ipfs.stop()
    }
  }
}
