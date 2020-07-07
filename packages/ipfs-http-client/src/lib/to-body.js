// @ts-check
'use strict'

const toStream = require('it-to-stream')

/**
 * @typedef {import('stream').Readable} Readable
 */

/**
 * @param {AsyncIterable<BlobPart>} it
 * @returns {Readable}
 */
module.exports = (it) =>
  toStream.readable(it)
