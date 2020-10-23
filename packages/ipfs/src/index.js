/* eslint-disable jsdoc/valid-types */
'use strict'

const IPFS = require('ipfs-core')

/**
 * @typedef { ReturnType<typeof IPFS['create']> extends Promise<infer U>
 * ? U : never } IPFS
 */

module.exports = IPFS
