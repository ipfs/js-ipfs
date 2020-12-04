'use strict'

const createGC = require('./gc')
const createStat = require('./stat')
const createVersion = require('./version')

class RepoAPI {
  /**
   * @param {Object} config
   * @param {GCLock} config.gcLock
   * @param {Pin} config.pin
   * @param {Repo} config.repo
   * @param {Refs} config.refs
   */
  constructor ({ gcLock, pin, repo, refs }) {
    this.gc = createGC({ gcLock, pin, refs, repo })
    this.stat = createStat({ repo })
    this.version = createVersion({ repo })
  }
}
module.exports = RepoAPI

/**
 * @typedef {import('..').GCLock} GCLock
 * @typedef {import('..').Pin} Pin
 * @typedef {import('..').Repo} Repo
 * @typedef {import('..').Refs} Refs
 * @typedef {import('..').AbortOptions} AbortOptions
 */
