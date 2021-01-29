'use strict'

const createAdd = require('./add')
const createClear = require('./clear')
const createList = require('./list')
const createReset = require('./reset')
const createRm = require('./rm')
class BootstrapAPI {
  /**
   * @param {Object} config
   * @param {Repo} config.repo
   */
  constructor ({ repo }) {
    this.add = createAdd({ repo })
    this.list = createList({ repo })
    this.rm = createRm({ repo })
    this.clear = createClear({ repo })
    this.reset = createReset({ repo })
  }
}
module.exports = BootstrapAPI

/**
 * @typedef {import('..').Repo} Repo
 * @typedef {import('..').AbortOptions} AbortOptions
 * @typedef {import('..').CID} CID
 * @typedef {import('..').Multiaddr} Multiaddr
 */
