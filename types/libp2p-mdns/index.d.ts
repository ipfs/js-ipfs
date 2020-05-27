declare module 'libp2p-mdns' {
  import LibP2pBootstrap from 'libp2p-bootstrap'
  import PeerInfo from 'peer-info'

  namespace LibP2pMdns {
  type Options = {
    broadcast?: boolean,
    interval?: number,
    peerInfo: PeerInfo,
    port?: number,
    serviceTag?: string
  };

  type Events = 'peer';
  }

  class LibP2pMdns extends LibP2pBootstrap {
    constructor (options: LibP2pMdns.Options);

    on (event: LibP2pMdns.Events, cb: (peerInfo: PeerInfo) => any): this;
  }
  // eslint-disable-next-line import/no-default-export
  export default LibP2pMdns;
}
