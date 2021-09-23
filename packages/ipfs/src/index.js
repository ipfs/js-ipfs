import {
  create as createImport,
  crypto as cryptoImport,
  isIPFS as isIPFSImport,
  CID as CIDImport,
  multiaddr as multiaddrImport,
  PeerId as PeerIdImport,
  globSource as globSourceImport,
  urlSource as urlSourceImport
} from 'ipfs-core'
import {
  path as pathImport
} from './path.js'

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 */

export const create = createImport
export const crypto = cryptoImport
export const isIPFS = isIPFSImport
export const CID = CIDImport
export const multiaddr = multiaddrImport
export const PeerId = PeerIdImport
export const globSource = globSourceImport
export const urlSource = urlSourceImport
export const path = pathImport
