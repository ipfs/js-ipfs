declare module 'libp2p-kad-dht' {
  class LibP2pKadDht {
    readonly isStarted: boolean;

    randomWalk: {
      start (queries?: number, period?: number, maxTimeout?: number): void;
      stop (): void;
    }
  }

  // eslint-disable-next-line import/no-default-export
  export default LibP2pKadDht;
}
