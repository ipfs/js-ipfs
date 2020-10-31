'use strict'

const createAdd = require('./add')
const createAddAll = require('./add-all')
const createLs = require('./ls')
const createRm = require('./rm')
const createRmAll = require('./rm-all')

class PinAPI {
  /**
   * @param {Object} config
   * @param {GCLock} config.gcLock
   * @param {DagReader} config.dagReader
   * @param {PinManager} config.pinManager
   */
  constructor ({ gcLock, dagReader, pinManager }) {
    const addAll = createAddAll({ gcLock, dagReader, pinManager })
    this.addAll = addAll
    this.add = createAdd({ addAll })
    const rmAll = createRmAll({ gcLock, dagReader, pinManager })
    this.rmAll = rmAll
    this.rm = createRm({ rmAll })
    this.ls = createLs({ dagReader, pinManager })
  }
}
module.exports = PinAPI

/**
 * @typedef {import('..').Repo} Repo
 * @typedef {import('..').GCLock} GCLock
 * @typedef {import('..').DagReader} DagReader
 * @typedef {import('..').PinManager} PinManager
 * @typedef {import('..').AbortOptions} AbortOptions
 * @typedef {import('..').CID} CID
 */
