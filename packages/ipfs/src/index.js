'use strict'

const IPFS = require('./core')

/**
 * @typedef { ReturnType<typeof IPFS['create']> extends Promise<infer U>
 *             ? U : never } IPFS
 */

module.exports = IPFS
