
import libp2pGossipsub from 'libp2p-gossipsub'
import libp2pFloodsub from 'libp2p-floodsub'

export const routers = {
  gossipsub: libp2pGossipsub,
  floodsub: libp2pFloodsub
}
