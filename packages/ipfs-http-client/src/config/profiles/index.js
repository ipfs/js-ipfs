
import {createApply} from './apply.js'
import {createList} from './list.js'

export class ProfilesAPI {
  /**
   * @param {import('../../types').Options} config
   */
  constructor (config) {
    this.apply = createApply(config)
    this.list = createList(config)
  }
}
