'use strict'

const createExport = require('./export')
const createGen = require('./gen')
const createImport = require('./import')
const createInfo = require('./info')
const createList = require('./list')
const createRename = require('./rename')
const createRm = require('./rm')

class KeyAPI {
  /**
   * @param {Object} config
   * @param {Keychain} config.keychain
   */
  constructor ({ keychain }) {
    this.gen = createGen({ keychain })
    this.list = createList({ keychain })
    this.rm = createRm({ keychain })
    this.rename = createRename({ keychain })
    this.export = createExport({ keychain })
    this.import = createImport({ keychain })
    this.info = createInfo({ keychain })
  }
}
module.exports = KeyAPI

/**
 * @typedef {import('..').Keychain} Keychain
 * @typedef {import('..').AbortOptions} AbortOptions
 *
 * @typedef {Object} Key
 * @property {string} name
 * @property {string} id
 */
