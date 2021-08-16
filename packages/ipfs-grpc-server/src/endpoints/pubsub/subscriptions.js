'use strict'

/**
 * @typedef {object} Subscription
 * @property {import('ipfs-core-types/src/pubsub').MessageHandlerFn} onMessage
 * @property {() => void} onUnsubscribe
 */

/** @type {Map<string, Subscription>} */
const subs = new Map()

module.exports = subs
