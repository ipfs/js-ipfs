'use strict'

const pkg = require('../../../package.json')
const promisify = require('promisify-es6')

module.exports = function version (self) {
  /**
   * @alias version
   * @memberof IPFS#
   * @method
   * @param {function(Error, IPFS#Version)} callback
   * @returns {Promise<IPFS#Version>|undefined}
   *
   * @see https://github.com/ipfs/interface-ipfs-core/tree/master/API/generic#id
   */
  return promisify((opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    callback(null, {
      version: pkg.version,
      repo: '',
      commit: ''
    })
  })
}

/**
 * @memberof IPFS#
 * @typedef {Object} Version
 * @param {string} version
 * @param {string} repo
 * @param {string} commit
 */
