'use strict'

const createAddAPI = require('./add')
const createAddAllAPI = require('./add-all')
const createCatAPI = require('./cat')
const createGetAPI = require('./get')
const createLsAPI = require('./ls')

/**
 * @typedef {AddAllContext & CatContext & GetContext & ListContext } Context
 * @typedef {import('./add-all').Context} AddAllContext
 * @typedef {import('./cat').Context} CatContext
 * @typedef {import('./get').Context} GetContext
 * @typedef {import('./ls').Context} ListContext
 */
class Root {
  /**
   * @param {Context} context
   */
  constructor ({ preload, repo, options }) {
    const addAll = createAddAllAPI({
      preload,
      repo,
      options
    })

    this.addAll = addAll
    this.add = createAddAPI({ addAll })
    this.cat = createCatAPI({ repo, preload })
    this.get = createGetAPI({ repo, preload })
    this.ls = createLsAPI({ repo, preload })
  }
}

module.exports = Root
