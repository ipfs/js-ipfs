
/**
 * @typedef {import('ipfs-core-types/src/pubsub').MessageHandlerFn} Subscription
 */

/** @type {Map<string, Map<string, Subscription>>} */
export const subscriptions = new Map()
