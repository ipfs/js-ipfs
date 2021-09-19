
/**
 * @typedef {object} Subscription
 * @property {import('ipfs-core-types/src/pubsub').MessageHandlerFn} onMessage
 * @property {() => void} onUnsubscribe
 */

/** @type {Map<string, Subscription>} */
export const subscriptions = new Map()
