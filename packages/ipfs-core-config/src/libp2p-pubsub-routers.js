import libp2pGossipsub from 'libp2p-gossipsub'
import libp2pFloodsub from 'libp2p-floodsub'

/** @typedef {import('libp2p-interfaces/src/pubsub')} PubSub */

/** @type {Record<string, { new(...args: any[]): PubSub }>} */
export const routers = {
  gossipsub: libp2pGossipsub,
  floodsub: libp2pFloodsub
}
