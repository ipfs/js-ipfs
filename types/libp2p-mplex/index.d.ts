declare module 'libp2p-mplex' {
  type Muxer = any

  class LibP2pMplex {
    constructor(conn: any, isListener: boolean)

    dialer (conn: any): Muxer
    listener (conn: any): Muxer

    muticodec: string
  }

  // eslint-disable-next-line import/no-default-export
  export default LibP2pMplex
}
