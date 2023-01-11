import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { floodsub } from '@libp2p/floodsub'

/** @typedef {import('@libp2p/interface-pubsub').PubSub} PubSub */

/** @type {() => Record<string, (components: any) => PubSub>}>} */
export const routers = () => ({
  gossipsub: gossipsub({
    fallbackToFloodsub: true,
    emitSelf: true,
    maxInboundStreams: 64,
    maxOutboundStreams: 128
  }),
  floodsub: floodsub({
    emitSelf: true
  })
})
