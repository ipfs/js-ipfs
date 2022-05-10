import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import {
  SendingQuery,
  PeerResponse,
  FinalPeer,
  QueryError,
  Provider,
  Value,
  AddingPeer,
  DialingPeer
} from './response-types.js'
import { Multiaddr } from '@multiformats/multiaddr'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * @typedef {import('@libp2p/interfaces/peer-id').PeerId} PeerId
 */

/**
 * @param {{Type: number, ID: string, Extra: string, Responses: {ID: string, Addrs: string[]}[]}} event
 * @returns {import('ipfs-core-types/src/dht').QueryEvent}
 */
export const mapEvent = (event) => {
  if (event.Type === SendingQuery) {
    return {
      name: 'SENDING_QUERY',
      type: event.Type
    }
  }

  if (event.Type === PeerResponse) {
    return {
      from: peerIdFromString(event.ID),
      name: 'PEER_RESPONSE',
      type: event.Type,
      // TODO: how to infer this from the go-ipfs response
      messageType: 0,
      // TODO: how to infer this from the go-ipfs response
      messageName: 'PUT_VALUE',
      closer: (event.Responses || []).map(({ ID, Addrs }) => ({ id: peerIdFromString(ID), multiaddrs: Addrs.map(addr => new Multiaddr(addr)), protocols: [] })),
      providers: (event.Responses || []).map(({ ID, Addrs }) => ({ id: peerIdFromString(ID), multiaddrs: Addrs.map(addr => new Multiaddr(addr)), protocols: [] }))
      // TODO: how to infer this from the go-ipfs response
      // record: ???
    }
  }

  if (event.Type === FinalPeer) {
    // dht.query ends with a FinalPeer event with no Responses
    /** @type {import('@libp2p/interfaces/peer-info').PeerInfo} */
    let peer = {
      // @ts-expect-error go-ipfs does not return this
      id: event.ID ?? peerIdFromString(event.ID),
      /** @type {Multiaddr[]} */
      multiaddrs: [],
      protocols: []
    }

    if (event.Responses && event.Responses.length) {
      // dht.findPeer has the result in the Responses field
      peer = {
        id: peerIdFromString(event.Responses[0].ID),
        multiaddrs: event.Responses[0].Addrs.map(addr => new Multiaddr(addr)),
        protocols: []
      }
    }

    return {
      name: 'FINAL_PEER',
      type: event.Type,
      peer
    }
  }

  if (event.Type === QueryError) {
    return {
      name: 'QUERY_ERROR',
      type: event.Type,
      error: new Error(event.Extra)
    }
  }

  if (event.Type === Provider) {
    return {
      name: 'PROVIDER',
      type: event.Type,
      providers: event.Responses.map(({ ID, Addrs }) => ({ id: peerIdFromString(ID), multiaddrs: Addrs.map(addr => new Multiaddr(addr)), protocols: [] }))
    }
  }

  if (event.Type === Value) {
    return {
      name: 'VALUE',
      type: event.Type,
      value: uint8ArrayFromString(event.Extra, 'base64pad')
    }
  }

  if (event.Type === AddingPeer) {
    const peers = event.Responses.map(({ ID }) => peerIdFromString(ID))

    if (!peers.length) {
      throw new Error('No peer found')
    }

    return {
      name: 'ADDING_PEER',
      type: event.Type,
      peer: peers[0]
    }
  }

  if (event.Type === DialingPeer) {
    return {
      name: 'DIALING_PEER',
      type: event.Type,
      peer: peerIdFromString(event.ID)
    }
  }

  throw new Error('Unknown DHT event type')
}
