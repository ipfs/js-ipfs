'use strict'

const IPFS = require('ipfs-core')

/**
 * Export IPFS instance type
 *
 * This will overlap onto the default export
 * in the generated `d.ts` file
 *
 * @typedef {import('ipfs-core').default} IPFS
 */

module.exports = IPFS
