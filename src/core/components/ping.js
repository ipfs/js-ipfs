'use strict'

const promisify = require('promisify-es6')

module.exports = function ping (self) {
  /**
   * @alias ping
   * @memberof IPFS#
   * @method
   * @param {function(Error)} callback
   * @returns {Promise<undefined>|undefined}
   */
  return promisify((callback) => {
    callback(new Error('Not implemented'))
  })
}
