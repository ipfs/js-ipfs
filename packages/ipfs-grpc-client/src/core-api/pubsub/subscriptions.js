'use strict'

/**
 * @typedef {import('ipfs-core-types/src/pubsub').MessageHandlerFn} Subscription
 */

/** @type {Map<string, Map<string, Subscription>>} */
const subs = new Map()

module.exports = subs
