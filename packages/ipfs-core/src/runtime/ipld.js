'use strict'

const mergeOptions = require('merge-options')
const multicodec = require('multicodec')

/**
 * @typedef {import('interface-ipld-format').Format<?>} IPLDFormat
 * @typedef {import('ipld').Options} IPLDOptions
 */

/**
 * All known (non-default) IPLD formats
 *
 * @type {Record<number, IPLDFormat>}
 */
const IpldFormats = {
  get [multicodec.DAG_PB] () {
    return require('ipld-dag-pb')
  },
  get [multicodec.DAG_CBOR] () {
    return require('ipld-dag-cbor')
  },
  get [multicodec.RAW] () {
    return require('ipld-raw')
  }
}

/**
 * @param {import('ipfs-block-service')} blockService
 * @param {Partial<IPLDOptions>} [options]
 */
module.exports = (blockService, options) => {
  return mergeOptions.call(
    // ensure we have the defaults formats even if the user overrides `formats: []`
    { concatArrays: true },
    {
      blockService: blockService,
      formats: [],
      /**
       * @type {import('ipld').LoadFormatFn}
       */
      loadFormat: (codec) => {
        if (IpldFormats[codec]) {
          return Promise.resolve(IpldFormats[codec])
        } else {
          throw new Error(`Missing IPLD format "${multicodec.getName(codec)}"`)
        }
      }
    }, options)
}
