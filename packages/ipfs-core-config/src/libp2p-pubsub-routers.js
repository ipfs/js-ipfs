import { GossipSub } from '@chainsafe/libp2p-gossipsub'
import { FloodSub } from '@libp2p/floodsub'

/** @typedef {import('@libp2p/interface-pubsub').PubSub} PubSub */

/** @type {() => Record<string, PubSub>}>} */
export const routers = () => ({
  gossipsub: new GossipSub({
    allowPublishToZeroPeers: true,
    fallbackToFloodsub: true,
    emitSelf: true,
    maxInboundStreams: 64,
    maxOutboundStreams: 128
  }),
  floodsub: new FloodSub({
    emitSelf: true
  })
})
