'use strict'

const debug = require('debug')
const errcode = require('err-code')
const promisify = require('promisify-es6')

const log = debug('jsipfs:name-pubsub')
log.error = debug('jsipfs:name-pubsub:error')

const isNamePubsubEnabled = (node) => (
  node._options.EXPERIMENTAL.ipnsPubsub && node._libp2pNode._floodSub
)

module.exports = function namePubsub (self) {
  return {
    /**
     * Query the state of IPNS pubsub.
     *
     * @returns {Promise|void}
     */
    state: promisify((callback) => {
      callback(null, {
        enabled: Boolean(isNamePubsubEnabled(self))
      })
    }),
    /**
     * Cancel a name subscription.
     *
     * @param {String} name subscription name.
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    cancel: promisify((name, callback) => {
      if (!isNamePubsubEnabled(self)) {
        const errMsg = 'IPNS pubsub subsystem is not enabled'

        log.error(errMsg)
        return callback(errcode(errMsg, 'ERR_IPNS_PS_NOT_ENABLED'))
      }

      self._ipns.pubsub.cancel(name, callback)
    }),
    /**
     * Show current name subscriptions.
     *
     * @param {function(Error)} [callback]
     * @returns {Promise|void}
     */
    subs: promisify((callback) => {
      if (!isNamePubsubEnabled(self)) {
        const errMsg = 'IPNS pubsub subsystem is not enabled'

        log.error(errMsg)
        return callback(errcode(errMsg, 'ERR_IPNS_PS_NOT_ENABLED'))
      }

      self._ipns.pubsub.getSubscriptions(callback)
    })
  }
}
