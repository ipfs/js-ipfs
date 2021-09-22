import mergeOpts from 'merge-options'
import { create } from '../../src/index.js'
import { createTempRepo } from './create-repo.js'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })

/**
 * @param {import('../../src/types').Options} config
 */
export default async (config = {}) => {
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

  /** @type {import('ipfs-core-types').IPFS} */
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
