import { ProfilesAPI } from './profiles/index.js'
import { createGet} from './get.js'
import { createGetAll } from './get-all.js'
import { createReplace } from './replace.js'
import { createSet } from './set.js'

export class ConfigAPI {
  /**
   * @param {import('../types').Options} config
   */
   constructor (config) {
    this.getAll = createGetAll(config),
    this.get = createGet(config),
    this.set = createSet(config),
    this.replace = createReplace(config),
    this.profiles = new ProfilesAPI(config)
  }
}