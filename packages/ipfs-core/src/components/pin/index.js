import { createAdd } from './add.js'
import { createAddAll } from './add-all.js'
import { createLs } from './ls.js'
import { createRm } from './rm.js'
import { createRmAll } from './rm-all.js'

export class PinAPI {
  /**
   * @param {object} config
   * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
   * @param {import('ipfs-repo').IPFSRepo} config.repo
   */
  constructor ({ codecs, repo }) {
    const addAll = createAddAll({ codecs, repo })
    this.addAll = addAll
    this.add = createAdd({ addAll })
    const rmAll = createRmAll({ codecs, repo })
    this.rmAll = rmAll
    this.rm = createRm({ rmAll })
    this.ls = createLs({ codecs, repo })

    /** @type {import('ipfs-core-types/src/pin/remote').API} */
    this.remote = {
      add: (cid, options = {}) => Promise.reject(new Error('Not implemented')),
      ls: async function * (query, options = {}) { return Promise.reject(new Error('Not implemented')) }, // eslint-disable-line require-yield
      rm: (query, options = {}) => Promise.reject(new Error('Not implemented')),
      rmAll: (query, options = {}) => Promise.reject(new Error('Not implemented')),
      service: {
        add: (name, credentials) => Promise.reject(new Error('Not implemented')),
        rm: (name, options = {}) => Promise.reject(new Error('Not implemented')),
        // @ts-expect-error return types seem to be broken by a recent ts release. doesn't matter here because
        // we are just throwing. Will be removed by https://github.com/protocol/web3-dev-team/pull/58
        ls: (options = {}) => Promise.reject(new Error('Not implemented'))
      }
    }
  }
}
