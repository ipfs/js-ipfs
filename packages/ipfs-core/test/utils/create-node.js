'use strict'

const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const IPFS = require('../../')
const createTempRepo = require('./create-repo-nodejs')

module.exports = async (config = {}) => {
  const repo = await createTempRepo()
  const ipfs = await IPFS.create(mergeOptions({
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
      await repo.teardown()
    }
  }
}
