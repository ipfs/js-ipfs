'use strict'

const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const { create } = require('../../src')
const createTempRepo = require('./create-repo')

/**
 * @param {import('../../src/types').Options} config
 */
module.exports = async (config = {}) => {
  let repo

  if (config.repo) {
    if (typeof config.repo === 'string') {
      repo = await createTempRepo({ path: config.repo })
    } else {
      repo = config.repo
    }
  } else {
    repo = await createTempRepo()
  }

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
