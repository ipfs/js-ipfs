/**
 * @typedef {import('@libp2p/interface-pubsub').Message} Message
 * @typedef {object} Subscription
 * @property {import('@libp2p/interfaces/events').EventHandler<Message>} onMessage
 * @property {() => void} onUnsubscribe
 */

/** @type {Map<string, Subscription>} */
export const subscriptions = new Map()
