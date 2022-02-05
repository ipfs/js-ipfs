import { createAdd } from './add.js'
import { createAddAll } from './add-all/index.js'
import { createCat } from './cat.js'
import { createGet } from './get.js'
import { createLs } from './ls.js'

/**
 * @typedef {AddAllContext & CatContext & GetContext & ListContext } Context
 * @typedef {import('./add-all').Context} AddAllContext
 * @typedef {import('./cat').Context} CatContext
 * @typedef {import('./get').Context} GetContext
 * @typedef {import('./ls').Context} ListContext
 */
export class RootAPI {
  /**
   * @param {Context} context
   */
  constructor ({ preload, repo, hashers, options }) {
    const addAll = createAddAll({
      preload,
      repo,
      options,
      hashers
    })

    this.addAll = addAll
    this.add = createAdd({ addAll })
    this.cat = createCat({ repo, preload })
    this.get = createGet({ repo, preload })
    this.ls = createLs({ repo, preload })
  }
}
