import { create as createImport } from './components/index.js'
import globSourceImport from 'ipfs-utils/src/files/glob-source.js'
import urlSourceImport from 'ipfs-utils/src/files/url-source.js'

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('./types').Options} Options
 * @typedef {import('./types').Libp2pFactoryFn} Libp2pFactoryFn
 * @typedef {import('./types').Libp2pFactoryFnArgs} Libp2pFactoryFnArgs
 * @typedef {import('./types').InitOptions} InitOptions
 * @typedef {import('./types').RelayOptions} RelayOptions
 * @typedef {import('./types').PreloadOptions} PreloadOptions
 * @typedef {import('./types').ExperimentalOptions} ExperimentalOptions
 * @typedef {import('./types').Preload} Preload
 * @typedef {import('./types').MfsPreload} MfsPreload
 * @typedef {import('./types').LoadBaseFn} LoadBaseFn
 * @typedef {import('./types').LoadCodecFn} LoadCodecFn
 * @typedef {import('./types').LoadHasherFn} LoadHasherFn
 * @typedef {import('./types').IPLDOptions} IPLDOptions
 */

export const create = createImport
export const globSource = globSourceImport
export const urlSource = urlSourceImport
