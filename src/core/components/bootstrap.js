'use strict'

module.exports = function bootstrap (self) {
  return {
    /**
     * @alias bootstrap.list
     * @memberof IPFS#
     * @param {function(Error, Array<string>)} callback
     * @returns {Promise<Array<string>>|undefined}
     */
    list: (callback) => {
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        callback(null, config.Bootstrap)
      })
    },

    /**
     * @alias bootstrap.add
     * @memberof IPFS#
     * @param {string} multiaddr
     * @param {function(Error)} callback
     * @returns {Promise<undefined>|undefined}
     */
    add: (multiaddr, callback) => {
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        config.Bootstrap.push(multiaddr)
        self._repo.config.set(config, callback)
      })
    },

    /**
     * @alias bootstrap.rm
     * @memberof IPFS#
     * @param {string} multiaddr
     * @param {function(Error)} callback
     * @returns {Promise<undefiend>|undefined}
     */
    rm: (multiaddr, callback) => {
      self._repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }

        config.Bootstrap = config.Bootstrap.filter((mh) => {
          if (mh === multiaddr) {
            return false
          } else {
            return true
          }
        })
        self._repo.config.set(config, callback)
      })
    }
  }
}
