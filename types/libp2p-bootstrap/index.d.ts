declare module 'libp2p-bootstrap' {
  import PeerInfo from 'peer-info'
  import Multiaddr from 'multiaddr'

  namespace LibP2pBootstrap {
  type Options = {
    list: Array<string | Multiaddr>,
    interval?: number
  };

  type Events = 'peer';
  }

  class LibP2pBootstrap {
    constructor (options: LibP2pBootstrap.Options);

    on (event: LibP2pBootstrap.Events, cb: (peerInfo: PeerInfo) => any): this;
  }
  // eslint-disable-next-line import/no-default-export
  export default LibP2pBootstrap;
}
