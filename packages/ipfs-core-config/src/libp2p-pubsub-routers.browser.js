import { GossipSub } from '@chainsafe/libp2p-gossipsub'

/** @typedef {import('@libp2p/interface-pubsub').PubSub} PubSub */

/** @type {() => Record<string, (components: any) => PubSub>}>} */
export const routers = () => ({
  // @ts-expect-error GossubSub is out of date
  gossipsub: (/** @type {any} */ components) => {
    const gossipsub = new GossipSub({
      allowPublishToZeroPeers: true,
      fallbackToFloodsub: true,
      emitSelf: true,
      maxInboundStreams: 64,
      maxOutboundStreams: 128
    })
    // @ts-expect-error GossubSub is out of date
    gossipsub.init({
      getPeerId () {
        return components.peerId
      },
      getPeerStore () {
        return components.peerStore
      },
      getRegistrar () {
        return components.registrar
      },
      getConnectionManager () {
        return components.connectionManager
      }
    })

    return gossipsub
  }
})
