declare module 'libp2p-secio' {
  import PeerId from 'peer-id'

  type LibP2pSecio = {
    encrypt (localId: PeerId, conn: any, remoteId: PeerId, callback: () => any): void
  }

  const secio: LibP2pSecio;

  // eslint-disable-next-line import/no-default-export
  export default secio;
}
