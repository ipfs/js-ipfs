import {
  create as createImport,
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
export const globSource = globSourceImport
export const urlSource = urlSourceImport
export const path = pathImport
