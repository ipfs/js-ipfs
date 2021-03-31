'use strict'

// @ts-ignore - no types
const mortice = require('mortice')

/**
 * @param {Object} config
 * @param {string} config.path
 * @param {boolean} [config.repoOwner]
 * @returns {GCLock}
 */
module.exports = ({ path, repoOwner }) =>
  mortice(path, {
    singleProcess: repoOwner !== false
  })

/**
 * @typedef {RWLock} GCLock
 *
 * @typedef {Object} RWLock
 * @property {() => Promise<Lock>} readLock
 * @property {() => Promise<Lock>} writeLock
 *
 * @typedef {() => void} Lock
 */
