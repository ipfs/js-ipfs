'use strict'

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')
const raw = require('ipld-raw')
const multicodec = require('multicodec')

/**
 * @typedef {import('cids')} CID
 * @typedef {import('interface-ipld-format').Format<any>} IPLDFormat
 * @typedef {import('multicodec').CodecName} CodecName
 * @typedef {import('../types').LoadFormatFn} LoadFormatFn
 */

/**
 * @type {LoadFormatFn}
 */
const noop = (codec) => {
  return Promise.reject(new Error(`Missing IPLD format "${codec}"`))
}

/**
 * Return an object containing supported IPLD Formats
 *
 * @param {object} [options] - IPLD options passed to the http client constructor
 * @param {IPLDFormat[]} [options.formats] - A list of IPLD Formats to use
 * @param {LoadFormatFn} [options.loadFormat] - An async function that can load a format when passed a codec name
 */
module.exports = ({ formats = [], loadFormat = noop } = {}) => {
  formats = formats || []
  loadFormat = loadFormat || noop

  const configuredFormats = {
    [multicodec.DAG_PB]: dagPB,
    [multicodec.DAG_CBOR]: dagCBOR,
    [multicodec.RAW]: raw
  }

  formats.forEach(format => {
    configuredFormats[format.codec] = format
  })

  /**
   * Attempts to load an IPLD format for the passed CID
   *
   * @param {CodecName} codec - The code to load the format for
   */
  const loadResolver = async (codec) => {
    const number = multicodec.getCodeFromName(codec)
    const format = configuredFormats[number] || await loadFormat(codec)

    if (!format) {
      throw Object.assign(
        new Error(`Missing IPLD format "${codec}"`),
        { missingMulticodec: codec }
      )
    }

    return format
  }

  return loadResolver
}
