
/**
 * @typedef {import('@libp2p/interface-pubsub').Message} Message
 * @typedef {import('@libp2p/interfaces/events').EventHandler<Message>} Subscription
 */

/** @type {Map<string, Map<string, Subscription>>} */
export const subscriptions = new Map()
